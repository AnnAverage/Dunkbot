package main

import (
	"encoding/binary"
	"flag"
	"fmt"
	"io"
	"math/rand"
	"os/exec"
	"strings"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/bwmarrin/discordgo"
	"github.com/layeh/gopus"
	redis "gopkg.in/redis.v3"
)

var discord *discordgo.Session
var rcli *redis.Client

type Play struct {
	GuildID   string
	ChannelID string
	UserID    string
	Sound     *Sound
	Forced    bool
}

var queues map[string]chan *Play = make(map[string]chan *Play)

type Sound struct {
	Name      string
	Weight    int
	PartDelay int

	encodeChan chan []int16
	buffer     [][]byte
}

func createSound(Name string, Weight int, PartDelay int) *Sound {
	return &Sound{
		Name:       Name,
		Weight:     Weight,
		PartDelay:  PartDelay,
		encodeChan: make(chan []int16, 10),
		buffer:     make([][]byte, 0),
	}
}

var SOUNDS []*Sound = []*Sound{
	createSound("default", 1000, 250),
	createSound("reverb", 800, 250),
	createSound("spam", 800, 0),
	createSound("tripletap", 800, 250),
	createSound("fourtap", 800, 250),
	createSound("distant", 500, 250),
	createSound("echo", 500, 250),
	createSound("clownfull", 250, 250),
	createSound("clownshort", 250, 250),
	createSound("clownspam", 250, 0),
	createSound("horn_highfartlong", 200, 250),
	createSound("horn_highfartshort", 200, 250),
	createSound("midshort", 100, 250),
	createSound("truck", 10, 250),
}

var (
	SOUND_RANGE    = 0
	BITRATE        = 128
	MAX_QUEUE_SIZE = 6
)

func (s *Sound) Encode() {
	encoder, err := gopus.NewEncoder(48000, 2, gopus.Audio)
	if err != nil {
		fmt.Println("NewEncoder Error:", err)
		return
	}

	encoder.SetBitrate(BITRATE * 1000)
	encoder.SetApplication(gopus.Audio)

	for {
		pcm, ok := <-s.encodeChan
		if !ok {
			// if chan closed, exit
			return
		}

		// try encoding pcm frame with Opus
		opus, err := encoder.Encode(pcm, 960, 960*2*2)
		if err != nil {
			fmt.Println("Encoding Error:", err)
			return
		}

		s.buffer = append(s.buffer, opus)
	}

}

func (s *Sound) Load() {
	s.encodeChan = make(chan []int16, 10)
	defer close(s.encodeChan)
	go s.Encode()

	ffmpeg := exec.Command("ffmpeg", "-i", "audio/airhorn_"+s.Name+".wav", "-vol", "256", "-f", "s16le", "-ar", "48000", "-ac", "2", "pipe:1")

	stdout, err := ffmpeg.StdoutPipe()
	if err != nil {
		fmt.Println("StdoutPipe Error:", err)
		return
	}

	err = ffmpeg.Start()
	if err != nil {
		fmt.Println("RunStart Error:", err)
		return
	}

	for {
		// read data from ffmpeg stdout
		InBuf := make([]int16, 960*2)
		err = binary.Read(stdout, binary.LittleEndian, &InBuf)
		if err == io.EOF || err == io.ErrUnexpectedEOF {
			return
		}
		if err != nil {
			fmt.Println("error reading from ffmpeg stdout :", err)
			return
		}

		// write pcm data to the encodeChan
		s.encodeChan <- InBuf
	}
}

func (s *Sound) Play(vc *discordgo.VoiceConnection) {
	vc.Speaking(true)
	defer vc.Speaking(false)

	for _, buff := range s.buffer {
		vc.OpusSend <- buff
	}
}

func getCurrentVoiceChannel(user *discordgo.User, guild *discordgo.Guild) *discordgo.Channel {
	for _, vs := range guild.VoiceStates {
		if vs.UserID == user.ID {
			channel, _ := discord.Channel(vs.ChannelID)
			return channel
		}
	}
	return nil
}

func randomRange(min, max int) int {
	rand.Seed(time.Now().Unix())
	return rand.Intn(max-min) + min
}

func getRandomSound() *Sound {
	var i int
	number := randomRange(0, SOUND_RANGE)

	for _, item := range SOUNDS {
		i += item.Weight

		if number < i {
			return item
		}
	}

	return nil
}

func enqueuePlay(user *discordgo.User, guild *discordgo.Guild, sound *Sound) {
	// Grab the users voice channel
	// TODO: sometimes this isn't accurate
	channel := getCurrentVoiceChannel(user, guild)
	if channel == nil {
		log.WithFields(log.Fields{
			"user":  user.ID,
			"guild": guild.ID,
		}).Warning("Failed to find channel to play sound in")
		return
	}

	var forced bool = true
	if sound == nil {
		forced = false
		sound = getRandomSound()
	}

	play := &Play{
		GuildID:   guild.ID,
		ChannelID: channel.ID,
		Sound:     sound,
		Forced:    forced,
	}

	// Check if we already have a connection to this guild
	_, exists := queues[guild.ID]

	if exists {
		if len(queues[guild.ID]) < MAX_QUEUE_SIZE {
			queues[guild.ID] <- play
		}
	} else {
		queues[guild.ID] = make(chan *Play, MAX_QUEUE_SIZE)
		playSound(play, nil)
	}

}

func playSound(play *Play, vc *discordgo.VoiceConnection) {
	var (
		err   error
		delay int = 0
	)

	log.WithFields(log.Fields{
		"play": play,
	}).Info("Playing sound")

	if vc == nil {
		// Only calculate delay if its the first time joining the channel
		if randomRange(1, 25) == 5 {
			delay = randomRange(2000, 8000)
		}

		// TODO: timeout
		vc, err = discord.ChannelVoiceJoin(play.GuildID, play.ChannelID, false, false)
		vc.Receive = false
		if err != nil {
			log.WithFields(log.Fields{
				"error": err,
			}).Error("Failed to play sound")
		}

		err = vc.WaitUntilConnected()
		if err != nil {
			log.WithFields(log.Fields{
				"error": err,
				"play":  play,
			}).Error("Failed to join voice channel")
			vc.Close()
			delete(queues, play.GuildID)
			return
		}
	}

	if vc.ChannelID != play.ChannelID {
		vc.ChangeChannel(play.ChannelID)
		time.Sleep(time.Millisecond * 200)
	}

	time.Sleep(time.Millisecond * time.Duration(delay))
	_, err = rcli.Pipelined(func(pipe *redis.Pipeline) error {
		var baseChar string

		if play.Forced {
			baseChar = "f"
		} else {
			baseChar = "a"
		}

		base := fmt.Sprintf("airhorn:%s", baseChar)

		pipe.Incr("airhorn:total")
		pipe.Incr(fmt.Sprintf("%s:total", base))
		pipe.Incr(fmt.Sprintf("%s:sound:%s", base, play.Sound.Name))
		pipe.Incr(fmt.Sprintf("%s:user:%s:sound:%s", base, play.UserID, play.Sound.Name))
		pipe.Incr(fmt.Sprintf("%s:guild:%s:sound:%s", base, play.GuildID, play.Sound.Name))
		pipe.Incr(fmt.Sprintf("%s:guild:%s:chan:%s:sound:%s", base, play.GuildID, play.ChannelID, play.Sound.Name))
		pipe.SAdd(fmt.Sprintf("%s:users", base), play.UserID)
		pipe.SAdd(fmt.Sprintf("%s:guilds", base), play.GuildID)
		pipe.SAdd(fmt.Sprintf("%s:channels", base), play.ChannelID)
		return nil
	})

	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Warning("Failed to track stats in redis")
	}

	play.Sound.Play(vc)

	if len(queues[play.GuildID]) > 0 {
		play := <-queues[play.GuildID]
		playSound(play, vc)
		return
	}

	time.Sleep(time.Millisecond * time.Duration(play.Sound.PartDelay))
	delete(queues, play.GuildID)
	vc.Close()
}

func onGuildCreate(s *discordgo.Session, event *discordgo.GuildCreate) {
	for _, channel := range event.Guild.Channels {
		if channel.ID == event.Guild.ID {
			s.ChannelMessageSend(channel.ID, "**AIRHORN BOT READY FOR HORNING. TYPE !AIRHORN IN CHAT TO ACTIVATE**")
			return
		}
	}
}

func onMessageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {
	parts := strings.Split(strings.ToLower(m.Content), " ")
	var sound *Sound

	if parts[0] == "!airhorn" {
		channel, _ := discord.Channel(m.ChannelID)
		if channel == nil {
			log.WithFields(log.Fields{
				"channel": m.ChannelID,
				"message": m.ID,
			}).Warning("Failed to grab channel")
			return
		}

		guild, _ := discord.Guild(channel.GuildID)
		if guild == nil {
			log.WithFields(log.Fields{
				"guild":   channel.GuildID,
				"channel": channel,
				"message": m.ID,
			}).Warning("Failed to grab guild")
			return
		}

		// Support !airhorn <sound>
		if len(parts) > 1 {
			for _, s := range SOUNDS {
				if parts[1] == s.Name {
					sound = s
				}
			}

			if sound == nil {
				return
			}
		}

		go enqueuePlay(m.Author, guild, sound)
		s.ChannelMessageDelete(m.ChannelID, m.ID)
	}
}

func main() {
	var (
		Token = flag.String("t", "", "Discord Authentication Token")
		Redis = flag.String("r", "", "Redis Connection String")
		err   error
	)
	flag.Parse()

	log.Info("Preloading sounds...")
	for _, sound := range SOUNDS {
		SOUND_RANGE += sound.Weight
		sound.Load()
	}

	log.Info("Connecting to redis...")
	rcli = redis.NewClient(&redis.Options{Addr: *Redis, DB: 0})
	_, err = rcli.Ping().Result()

	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Fatal("Failed to connect to redis")
		return
	}

	log.Info("Starting discord session...")
	discord, err = discordgo.New(*Token)
	// discord.Debug = true
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Fatal("Failed to create discord session")
		return
	}

	discord.AddHandler(onGuildCreate)
	discord.AddHandler(onMessageCreate)

	err = discord.Open()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Fatal("Failed to create discord websocket connection")
		return
	}

	log.Info("AIRHORNBOT is ready to horn it up.")
	for {
		time.Sleep(time.Second * 1)
	}
}

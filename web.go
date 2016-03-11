package main

import (
	"flag"
	"fmt"
	"github.com/antage/eventsource"
	"golang.org/x/oauth2"
	redis "gopkg.in/redis.v3"
	"io/ioutil"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

var (
	rcli          *redis.Client
	oauthConf     *oauth2.Config
	es            eventsource.EventSource
	htmlIndexPage string
	stateString   string
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(htmlIndexPage))
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	url := oauthConf.AuthCodeURL(stateString, oauth2.AccessTypeOnline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func handleCallback(w http.ResponseWriter, r *http.Request) {
	state := r.FormValue("state")
	if state != stateString {
		fmt.Printf("invalid oauth state, expected '%s', got '%s'\n", stateString, state)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	code := r.FormValue("code")
	_, err := oauthConf.Exchange(oauth2.NoContext, code)
	if err != nil {
		fmt.Printf("oauthConf.Exchange() failed with '%s'\n", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func server() {
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/discord_oauth_cb", handleCallback)
	http.Handle("/events", es)

	port := os.GetEnv("PORT")
	if port == "" {
		port = "14000"
	}

	http.ListenAndServe(host, ":"+port)
}

func broadcastLoop() {
	var id int = 0
	for {
		time.Sleep(time.Second * 1)
		result := rcli.Get("airhorn:total")
		if result.Err() != nil {
			fmt.Printf("broadcastLoop error: %s\n", result.Err())
			continue
		}

		es.SendEventMessage(result.Val(), "message", strconv.Itoa(id))
		id += 1
	}
}

func main() {
	var (
		ClientID     = flag.String("i", "", "OAuth2 Client ID")
		ClientSecret = flag.String("s", "", "OAtuh2 Client Secret")
		Redis        = flag.String("r", "", "Redis Connection String")
		err          error
	)
	flag.Parse()

	fmt.Printf("Connecting to redis...\n")
	rcli = redis.NewClient(&redis.Options{Addr: *Redis, DB: 0})
	_, err = rcli.Ping().Result()

	if err != nil {
		fmt.Printf("Failed to connect to redis: %s\n", err)
		return
	}

	es = eventsource.New(nil, nil)
	defer es.Close()
	go broadcastLoop()

	data, err := ioutil.ReadFile("templates/index.html")
	if err != nil {
		fmt.Printf("Error opening index.html: %s\n", err)
		return
	}

	htmlIndexPage = string(data[:])

	baseUrl := "http://discordapp.com/api"
	endpoint := oauth2.Endpoint{
		AuthURL:  baseUrl + "/oauth2/authorize",
		TokenURL: baseUrl + "/oauth2/token",
	}

	oauthConf = &oauth2.Config{
		ClientID:     *ClientID,
		ClientSecret: *ClientSecret,
		Scopes:       []string{"bot"},
		Endpoint:     endpoint,
	}

	stateString = randSeq(32)

	server()
}

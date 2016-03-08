package main

import (
	"flag"
	"fmt"
	"github.com/gorilla/websocket"
	"golang.org/x/oauth2"
	redis "gopkg.in/redis.v3"
	"io/ioutil"
	"math/rand"
	"net/http"
	"sync"
	"time"
)

type Broadcaster struct {
	Clients []*websocket.Conn
	lock    sync.Mutex
}

var (
	rcli          *redis.Client
	oauthConf     *oauth2.Config
	upgrader      websocket.Upgrader
	broadcaster   *Broadcaster
	htmlIndexPage string
	stateString   string
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func NewBroadcaster() *Broadcaster {
	return &Broadcaster{
		Clients: make([]*websocket.Conn, 0),
	}
}

func (b *Broadcaster) Listen(conn *websocket.Conn) {
	b.lock.Lock()
	defer b.lock.Unlock()
	b.Clients = append(b.Clients, conn)
}

func (b *Broadcaster) Close(conn *websocket.Conn) {
	b.lock.Lock()
	defer b.lock.Unlock()
	for i, other := range b.Clients {
		if other == conn {
			b.Clients = append(b.Clients[:i], b.Clients[i+1:]...)
		}
	}
}

func (b *Broadcaster) Broadcast(data []byte) {
	b.lock.Lock()
	defer b.lock.Unlock()

	for _, c := range b.Clients {
		c.WriteMessage(websocket.TextMessage, data)
	}
}

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

func handleWebsocket(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("Failed to upgrade: %s\n", err)
		return
	}

	defer c.Close()

	fmt.Println("Connected")
	broadcaster.Listen(c)

	for {
		_, _, err := c.ReadMessage()
		if err != nil {
			broadcaster.Close(c)
		}
	}

}

func server() {
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/discord_oauth_cb", handleCallback)
	http.HandleFunc("/ws", handleWebsocket)

	http.ListenAndServe(":14000", nil)
}

func broadcastLoop() {
	for {
		time.Sleep(time.Second * 1)
		result := rcli.Get("airhorn:total")
		if result.Err() != nil {
			fmt.Printf("broadcastLoop error: %s\n", result.Err())
			continue
		}

		broadcaster.Broadcast([]byte(result.Val()))
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
		// log.WithFields(log.Fields{
		// 	"error": err,
		// }).Fatal("Failed to connect to redis")
		return
	}

	broadcaster = NewBroadcaster()
	go broadcastLoop()

	data, err := ioutil.ReadFile("templates/index.html")
	if err != nil {
		fmt.Printf("Error opening index.html: %s\n", err)
		return
	}

	htmlIndexPage = string(data[:])

	baseUrl := "http://localhost:3000"
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

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/antage/eventsource"
	"github.com/bwmarrin/discordgo"
	"github.com/gorilla/sessions"
	"golang.org/x/oauth2"
	redis "gopkg.in/redis.v3"
	"io/ioutil"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
)

var (
	rcli          *redis.Client
	oauthConf     *oauth2.Config
	store         *sessions.CookieStore
	es            eventsource.EventSource
	htmlIndexPage string
	stateString   string
	apiBaseUrl    = "https://discordapp.com/api"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

// Return a random character sequence of n length
func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

// Renders the index page
func handleIndex(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(htmlIndexPage))
}

// Redirects to the oauth2
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

	errorMsg := r.FormValue("error")
	if errorMsg != "" {
		fmt.Printf("Error: %s\n", errorMsg)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	token, err := oauthConf.Exchange(oauth2.NoContext, r.FormValue("code"))
	if err != nil {
		fmt.Printf("oauthConf.Exchange() failed with '%s'\n", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	body, _ := json.Marshal(map[interface{}]interface{}{})
	req, err := http.NewRequest("GET", apiBaseUrl+"/users/@me", bytes.NewBuffer(body))
	if err != nil {
		fmt.Printf("Error: %s\n", err)
		return
	}

	req.Header.Set("Authorization", token.Type()+" "+token.AccessToken)
	client := &http.Client{Timeout: (20 * time.Second)}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error: %s\n", err)
		return
	}

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error: %s\n", err)
		return
	}

	user := discordgo.User{}
	err = json.Unmarshal(respBody, &user)
	if err != nil {
		fmt.Printf("Error: %s\n", err)
		return
	}

	session, _ := store.Get(r, "session")
	session.Values["token"] = token.AccessToken
	session.Values["username"] = user.Username
	session.Values["tag"] = user.Discriminator
	session.Save(r, w)

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func handleMe(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session")

	body, err := json.Marshal(map[string]interface{}{
		"username": session.Values["username"],
		"tag":      session.Values["tag"],
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func server() {
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/me", handleMe)
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/discord_oauth_cb", handleCallback)
	http.Handle("/events", es)

	port := os.Getenv("PORT")
	if port == "" {
		port = "14000"
	}

	http.ListenAndServe(":"+port, nil)
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

	// Load the HTML static page
	data, err := ioutil.ReadFile("templates/index.html")
	if err != nil {
		fmt.Printf("Error opening index.html: %s\n", err)
		return
	}
	htmlIndexPage = string(data[:])

	// Create a cookie store
	store = sessions.NewCookieStore([]byte(*ClientSecret))

	endpoint := oauth2.Endpoint{
		AuthURL:  apiBaseUrl + "/oauth2/authorize",
		TokenURL: apiBaseUrl + "/oauth2/token",
	}

	oauthConf = &oauth2.Config{
		ClientID:     *ClientID,
		ClientSecret: *ClientSecret,
		Scopes:       []string{"bot", "identify"},
		Endpoint:     endpoint,
		RedirectURL:  "https://airhornbot.com/discord_oauth_cb",
	}

	stateString = randSeq(32)

	server()
}

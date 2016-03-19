BOT_BINARY=airhornbot
WEB_BINARY=airhornweb

bot:
	go build -o ${BOT_BINARY} cmd/bot/bot.go

web:
	go build -o ${WEB_BINARY} cmd/webserver/web.go

clean:
	rm ${BOT_BINARY} ${WEB_BINARY}

all:
	bot web

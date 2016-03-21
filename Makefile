BOT_BINARY=bot
WEB_BINARY=web

bot: cmd/bot/bot.go
	go build -o ${BOT_BINARY} cmd/bot/bot.go

web: cmd/webserver/web.go
	go build -o ${WEB_BINARY} cmd/webserver/web.go

.PHONY: clean
clean:
	rm ${BOT_BINARY} ${WEB_BINARY}

.PHONY: all
all: bot web

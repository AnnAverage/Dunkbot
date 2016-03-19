BOT_BINARY=bot
WEB_BINARY=web

bot:
	go build -o ${BOT_BINARY} cmd/bot/bot.go

web:
	go build -o ${WEB_BINARY} cmd/webserver/web.go

.PHONY: clean
clean:
	rm ${BOT_BINARY} ${WEB_BINARY}

.PHONY: all
all: bot web

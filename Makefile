BOT_BINARY=airhornbot
WEB_BINARY=airhornweb

bot:
	go build -o ${BOT_BINARY} bot.go

web:
	go build -o ${WEB_BINARY} web.go

clean:
	rm ${BOT_BINARY} ${WEB_BINARY}

all:
	bot web

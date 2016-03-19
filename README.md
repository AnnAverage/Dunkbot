# Airhorn Bot
Airhorn is an example implementation of the [Discord API](https://discordapp.com/developers/docs/intro"). Airhorn bot utilizes the [discordgo](https://github.com/bwmarrin/discordgo) library, a free and open source library.

## Usage
Airhorn Bot has too components, a bot client that handles the playing of loyal airhorns, and a web server that implements OAuth2 and stats. Once added to your server, airhorn bot can be summoned by running `!airhorn`.

### Building / Running
Airhorn bot can be compiled with the provided Makefile by simply running `make`. This produces two binaries, `airhornbot` and `airhornweb`. Airhorn bot requires a local redis-server to track statistics.

### Running the Bot
Run the bot like so:

```
./airhornbot -r "localhost:6379" -t "MY_BOT_ACCOUNT_TOKEN"
```

### Running the Web Server
Run the web server like so:

```
./airhornweb -r "localhost:6379" -i MY_APPLICATION_ID -s 'MY_APPLICATION_SECRET"
```

## Thanks
Thanks to the awesome (one might describe them as smart... loyal... appreciative...) [iopred](https://github.com/iopred) and [bwmarrin](https://github.com/bwmarrin/discordgo) for helping code review the initial release.

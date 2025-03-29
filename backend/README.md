## Setup

Create a file called `.env` in the project root dir with the necessary API keys:
```bash
DEEPGRAM_API_KEY=YOUR_KEY_HERE # https://console.deepgram.com/
OPENAI_API_KEY=YOUR_KEY_HERE # https://platform.openai.com/
```

```bash
./setup.sh

hatch shell
hatch run start
exit
```

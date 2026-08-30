from pathlib import Path
import wave


ROOT = Path(__file__).resolve().parents[2]
AUDIO = ROOT / "Reportaje" / "assets" / "audio"

# The original routine drives PIT channel 0 with divisor 0x4A and advances the
# source byte on every second interrupt. The resulting source-data rate is 8062 Hz.
SOURCE_RATE = round(1_193_182 / 0x4A / 2)


def write_unsigned_pcm(name: str, data: bytes) -> None:
    destination = AUDIO / name
    with wave.open(str(destination), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(1)
        output.setframerate(SOURCE_RATE)
        output.writeframes(data)
    print(f"{destination.name}: {len(data) / SOURCE_RATE:.2f}s at {SOURCE_RATE} Hz")


if __name__ == "__main__":
    ave = (ROOT / "Digital Ave Maria" / "AVEMARIA1.BIN").read_bytes()
    ave += (ROOT / "Digital Ave Maria" / "AVEMARIA2.BIN").read_bytes()
    pirata = (ROOT / "Digital Pirata" / "PIRATA.BIN").read_bytes()

    write_unsigned_pcm("ave-maria-pc.wav", ave)
    write_unsigned_pcm("pirata-pc.wav", pirata)

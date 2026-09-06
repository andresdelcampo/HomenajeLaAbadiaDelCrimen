from pathlib import Path
import struct
import wave


ROOT = Path(__file__).resolve().parents[2]
AUDIO = ROOT / "Homenaje" / "assets" / "audio"

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


def resample_unsigned_pcm(data: bytes, source_rate: float, target_rate: int = 48_000) -> list[int]:
    """Linearly resample the utility's unsigned 8-bit source to signed PCM16."""
    frame_count = round(len(data) * target_rate / source_rate)
    frames: list[int] = []
    for index in range(frame_count):
        position = index * source_rate / target_rate
        left = min(int(position), len(data) - 1)
        right = min(left + 1, len(data) - 1)
        fraction = position - left
        sample = data[left] + (data[right] - data[left]) * fraction
        frames.append(round((sample - 128) * 256))
    return frames


def write_original_pirata_sequence(data: bytes) -> None:
    """Reproduce ABPIRATA option 4: ten passes, lowering pitch each time."""
    frames: list[int] = []
    for repetition in range(10):
        divisor = 0x4A + repetition * 7
        rate = 1_193_182 / divisor / 2
        frames.extend(resample_unsigned_pcm(data, rate))

    destination = AUDIO / "pirata-pc-original.wav"
    with wave.open(str(destination), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(48_000)
        output.writeframes(struct.pack(f"<{len(frames)}h", *frames))
    print(f"{destination.name}: {len(frames) / 48_000:.2f}s at 48000 Hz")


if __name__ == "__main__":
    ave = (ROOT / "Digital Ave Maria" / "AVEMARIA1.BIN").read_bytes()
    ave += (ROOT / "Digital Ave Maria" / "AVEMARIA2.BIN").read_bytes()
    pirata = (ROOT / "Digital Pirata" / "PIRATA.BIN").read_bytes()

    write_unsigned_pcm("ave-maria-pc.wav", ave)
    write_unsigned_pcm("pirata-pc.wav", pirata)
    write_original_pirata_sequence(pirata)

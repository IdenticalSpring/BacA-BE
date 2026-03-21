import argparse
import os
import sys


def synthesize_with_edge_tts(text: str, output: str, voice: str, rate: str) -> None:
    import asyncio
    import edge_tts

    async def run() -> None:
        communicator = edge_tts.Communicate(text=text, voice=voice, rate=rate)
        await communicator.save(output)

    asyncio.run(run())


def synthesize_with_gtts(text: str, output: str, lang: str) -> None:
    from gtts import gTTS

    tts = gTTS(text=text, lang=lang, slow=False)
    tts.save(output)


def main() -> int:
    parser = argparse.ArgumentParser(description="Local TTS worker using edge-tts and gTTS")
    parser.add_argument("--text", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--provider", default="auto", choices=["auto", "edge", "gtts"])
    parser.add_argument("--voice", default="en-US-JennyNeural")
    parser.add_argument("--lang", default="en")
    parser.add_argument("--rate", default="+0%")

    args = parser.parse_args()

    text = args.text.strip()
    if not text:
      raise ValueError("Text is empty")

    output_dir = os.path.dirname(args.output)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    errors = []

    if args.provider in ("auto", "edge"):
        try:
            synthesize_with_edge_tts(text, args.output, args.voice, args.rate)
            print("provider=edge-tts")
            return 0
        except Exception as exc:
            errors.append(f"edge-tts failed: {exc}")
            if args.provider == "edge":
                raise

    if args.provider in ("auto", "gtts"):
        try:
            synthesize_with_gtts(text, args.output, args.lang)
            print("provider=gtts")
            return 0
        except Exception as exc:
            errors.append(f"gTTS failed: {exc}")
            raise RuntimeError(" | ".join(errors))

    raise RuntimeError("No TTS provider executed")


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)

#!/bin/bash
# Download gear images and convert to WebP
# Usage: bash scripts/download-gear-images.sh

set -euo pipefail

BASE="$(cd "$(dirname "$0")/.." && pwd)"
MIC_DIR="$BASE/public/assets/gear/microphones"
PRE_DIR="$BASE/public/assets/gear/preamps"

download_and_convert() {
  local url="$1"
  local outdir="$2"
  local id="$3"
  local dest="$outdir/$id.webp"

  if [[ -f "$dest" ]]; then
    echo "  SKIP $id (exists)"
    return
  fi

  local tmp
  tmp=$(mktemp /tmp/gear-img-XXXXXX)
  local ext="${url##*.}"
  ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"
  [[ "$ext" == "jpeg" ]] && ext="jpg"

  echo "  GET  $id ← $url"
  if ! curl -fsSL --max-time 15 -o "$tmp.$ext" "$url" 2>/dev/null; then
    echo "  FAIL $id (download failed)"
    rm -f "$tmp" "$tmp.$ext"
    return
  fi

  if cwebp -quiet -q 82 -resize 600 0 "$tmp.$ext" -o "$dest" 2>/dev/null; then
    echo "  OK   $id → $(du -h "$dest" | cut -f1)"
  else
    echo "  FAIL $id (convert failed)"
  fi
  rm -f "$tmp" "$tmp.$ext"
}

echo "=== Microphone Images ==="

# Shure
download_and_convert "https://recordinghacks.com/microphone-photo/00002/Shure/SM57.jpg" "$MIC_DIR" "mic-sm57"
download_and_convert "https://recordinghacks.com/microphone-photo/00239/Shure/SM58.jpg" "$MIC_DIR" "mic-sm58"
download_and_convert "https://recordinghacks.com/microphone-photo/00241/Shure/SM7B.jpg" "$MIC_DIR" "mic-sm7b"
download_and_convert "https://recordinghacks.com/microphone-photo/00205/Shure/Beta-52A.jpg" "$MIC_DIR" "mic-beta52a"
download_and_convert "https://recordinghacks.com/microphone-photo/00242/Shure/SM81.jpg" "$MIC_DIR" "mic-sm81"

# EV
download_and_convert "https://recordinghacks.com/microphone-photo/00388/Electro-Voice/RE20.jpg" "$MIC_DIR" "mic-ev-re20"
download_and_convert "https://recordinghacks.com/microphone-photo/00387/Electro-Voice/RE200.jpg" "$MIC_DIR" "mic-ev-re200"
download_and_convert "https://recordinghacks.com/microphone-photo/00398/Electro-Voice/N-D967.jpg" "$MIC_DIR" "mic-ev-nd967"
download_and_convert "https://recordinghacks.com/microphone-photo/00367/Electro-Voice/N-D868.jpg" "$MIC_DIR" "mic-ev-nd868"
download_and_convert "https://recordinghacks.com/microphone-photo/00363/Electro-Voice/N-D767a.jpg" "$MIC_DIR" "mic-ev-nd767a"
download_and_convert "https://recordinghacks.com/microphone-photo/00365/Electro-Voice/N-D468.jpg" "$MIC_DIR" "mic-ev-nd468"
download_and_convert "https://recordinghacks.com/microphone-photo/00366/Electro-Voice/N-D478.jpg" "$MIC_DIR" "mic-ev-nd478"
download_and_convert "https://recordinghacks.com/microphone-photo/00987/Electro-Voice/N-D357.jpg" "$MIC_DIR" "mic-ev-nd357"

# Audix
download_and_convert "https://recordinghacks.com/microphone-photo/00767/Audix/SCX25A.jpg" "$MIC_DIR" "mic-audix-scx25a"
download_and_convert "https://recordinghacks.com/microphone-photo/01114/Audix/D1.jpg" "$MIC_DIR" "mic-audix-d1"
download_and_convert "https://recordinghacks.com/microphone-photo/00754/Audix/i5.jpg" "$MIC_DIR" "mic-audix-i5"
download_and_convert "https://recordinghacks.com/microphone-photo/00479/Audix/D2.jpg" "$MIC_DIR" "mic-audix-d2"
download_and_convert "https://recordinghacks.com/microphone-photo/00478/Audix/D4.jpg" "$MIC_DIR" "mic-audix-d4"
download_and_convert "https://recordinghacks.com/microphone-photo/00477/Audix/D6.jpg" "$MIC_DIR" "mic-audix-d6"
download_and_convert "https://recordinghacks.com/microphone-photo/01424/Audix/OM5.jpg" "$MIC_DIR" "mic-audix-om5"
download_and_convert "https://recordinghacks.com/microphone-photo/01425/Audix/OM6.jpg" "$MIC_DIR" "mic-audix-om6"
download_and_convert "https://recordinghacks.com/microphone-photo/01522/Audix/OM7.jpg" "$MIC_DIR" "mic-audix-om7"

# Telefunken
download_and_convert "https://www.telefunken-elektroakustik.com/wp-content/uploads/2023/01/TF51aFront-scaled.jpg" "$MIC_DIR" "mic-telefunken-tf51"
download_and_convert "https://www.telefunken-elektroakustik.com/wp-content/uploads/2023/01/StandardM80Front-scaled.jpg" "$MIC_DIR" "mic-telefunken-m80"
download_and_convert "https://www.telefunken-elektroakustik.com/wp-content/uploads/2018/09/M80-SH-Front-1x1-1.jpg" "$MIC_DIR" "mic-telefunken-m80s"
download_and_convert "https://www.telefunken-elektroakustik.com/wp-content/uploads/2018/09/M81-SH-Front-1x1-1.jpg" "$MIC_DIR" "mic-telefunken-m81s"

# Sennheiser
download_and_convert "https://recordinghacks.com/microphone-photo/00468/Sennheiser/MD-441.jpg" "$MIC_DIR" "mic-sennheiser-md441"

# AKG
download_and_convert "https://recordinghacks.com/microphone-photo/00641/AKG-Acoustics/C-451.jpg" "$MIC_DIR" "mic-akg-c451e"
download_and_convert "https://recordinghacks.com/microphone-photo/00299/AKG-Acoustics/C-451-B.jpg" "$MIC_DIR" "mic-akg-c451b"
download_and_convert "https://recordinghacks.com/microphone-photo/00319/AKG-Acoustics/D-112.jpg" "$MIC_DIR" "mic-akg-d112"

# Audio-Technica
download_and_convert "https://recordinghacks.com/microphone-photo/00016/Audio-Technica/AT4033-CL.jpg" "$MIC_DIR" "mic-at-at4033a"
download_and_convert "https://recordinghacks.com/microphone-photo/00054/Audio-Technica/ATM25.jpg" "$MIC_DIR" "mic-atm25"

# Beyerdynamic
download_and_convert "https://recordinghacks.com/microphone-photo/00793/beyerdynamic/MC-930.jpg" "$MIC_DIR" "mic-beyer-mc930"
download_and_convert "https://recordinghacks.com/microphone-photo/00786/beyerdynamic/M-201-TG.jpg" "$MIC_DIR" "mic-beyer-m201"
download_and_convert "https://recordinghacks.com/microphone-photo/00414/beyerdynamic/M422.jpg" "$MIC_DIR" "mic-beyer-m422nc"

# Other mics
download_and_convert "https://recordinghacks.com/microphone-photo/00441/Heil-Sound/PR-40.jpg" "$MIC_DIR" "mic-heil-pr40"
download_and_convert "https://recordinghacks.com/microphone-photo/00576/Coles/4038.jpg" "$MIC_DIR" "mic-coles-4038"
download_and_convert "https://recordinghacks.com/microphone-photo/00651/Cascade/Fat-Head-II.jpg" "$MIC_DIR" "mic-cascade-fathead2"
download_and_convert "https://recordinghacks.com/microphone-photo/01813/Sony/C100.jpg" "$MIC_DIR" "mic-sony-c100"

# Boutique — manufacturer sites
download_and_convert "https://wunderaudio.com/wp-content/uploads/2017/12/CM7-GS.jpg" "$MIC_DIR" "mic-wunder-cm7gs"
download_and_convert "https://stamaudio.com/wp-content/uploads/2022/05/sa87iBbg-scaled.jpg" "$MIC_DIR" "mic-stam-sa87-black"
download_and_convert "https://earthworksaudio.com/wp-content/uploads/2023/01/ethos_broadcasting_microphone.jpg" "$MIC_DIR" "mic-earthworks-ethos"
download_and_convert "https://www.minidsp.com/images/stories/virtuemart/product/_MG_0914_2.jpg" "$MIC_DIR" "mic-umik1"

echo ""
echo "=== Preamp Images ==="

download_and_convert "https://puebloaudio.com/uploads/3/5/0/2/35025048/jr22_orig.jpg" "$PRE_DIR" "pre-pueblo-jr22"
download_and_convert "https://adesignsaudio.com/images/products/thumbs/mp2athumb.jpg" "$PRE_DIR" "pre-adesigns-mp2a"
download_and_convert "https://apiaudio.com/wp-content/uploads/2024/08/api-3122v-mic-pre_167419_1.jpg" "$PRE_DIR" "pre-api-3122v"
download_and_convert "https://sonicfarm.com/wp-content/uploads/2012/04/creamer.jpg" "$PRE_DIR" "pre-sonicfarm-creamer"
download_and_convert "https://chandlerlimited.com/wp-content/uploads/2024/06/Chandler-Limited-Germanium-Preamp-DI-front.jpg" "$PRE_DIR" "pre-chandler-germanium"
download_and_convert "https://wunderaudio.com/wp-content/uploads/2020/10/PEQ2R4-2.jpg" "$PRE_DIR" "pre-wunder-peq2r"

echo ""
echo "=== Done ==="
echo "Mic images:    $(ls "$MIC_DIR"/*.webp 2>/dev/null | wc -l | tr -d ' ')"
echo "Preamp images: $(ls "$PRE_DIR"/*.webp 2>/dev/null | wc -l | tr -d ' ')"

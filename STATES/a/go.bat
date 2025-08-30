@echo off
setlocal enabledelayedexpansion

set "remove=https://deblaschke.github.io/travel-slideshows-west/"

(for /f "usebackq delims=" %%A in ("input.txt") do (
    set "line=%%A"
    set "line=!line:%remove%=!"
    echo !line!
)) > output.txt
























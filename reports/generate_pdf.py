import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_pdf():
    html_path = os.path.join(BASE_DIR, "report_print.html")
    pdf_path = os.path.join(BASE_DIR, "Digital_Wallet_Management_System_Report.pdf")

    if not os.path.exists(html_path):
        print(f"[ERROR] HTML source file not found at: {html_path}")
        sys.exit(1)

    chrome_candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "google-chrome",
        "chromium"
    ]

    chrome_bin = None
    for candidate in chrome_candidates:
        if os.path.exists(candidate):
            chrome_bin = candidate
            break
        try:
            res = subprocess.run(["which", candidate], capture_output=True, text=True)
            if res.returncode == 0 and res.stdout.strip():
                chrome_bin = res.stdout.strip()
                break
        except Exception:
            pass

    if not chrome_bin:
        print("[ERROR] Google Chrome binary not found for headless PDF generation.")
        sys.exit(1)

    print(f"[PDF] Compiling 24-page academic report using: {chrome_bin}")
    cmd = [
        chrome_bin,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf_path}",
        "--no-pdf-header-footer",
        html_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 10000:
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"[PDF] Generated successfully: {pdf_path} ({size_kb:.1f} KB)")
    else:
        print(f"[ERROR] PDF generation failed or empty. Stderr: {result.stderr}")
        sys.exit(1)

if __name__ == '__main__':
    generate_pdf()

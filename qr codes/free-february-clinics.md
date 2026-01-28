<style>
  body {
    background: #ffffff;
  }

  .qr-poster {
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
    text-align: center;
    color: #00013a;
    font-family: "proxima-nova", "Segoe UI", Helvetica, Tahoma, Geneva, Verdana, sans-serif;
    min-height: calc(100vh - 0.5in);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .qr-poster__title {
    font-size: clamp(2rem, 4vw, 3rem);
    margin: 0 0 10px;
    text-align: center !important;
    width: 100%;
    color: #00013a;
    line-height: 1.1;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .qr-poster__subhead {
    font-size: 1.35rem;
    color: #333333;
    margin: 0 0 24px;
    text-align: center;
  }

  .qr-poster__details {
    list-style: none;
    padding: 0;
    margin: 0 0 24px;
    color: #333333;
    text-align: center;
  }

  .qr-poster__details li {
    margin: 6px 0;
  }

  .qr-poster__qr {
    width: 800px;
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto 18px;
    border: 1px solid #cd163f;
    padding: 10px;
    background: #ffffff;
    box-sizing: border-box;
  }

  .qr-poster__url {
    font-size: 0.95rem;
    color: #333333;
    margin: 0;
    word-break: break-word;
  }

  .qr-poster__url a {
    color: #00013a;
    text-decoration: none;
    font-weight: 600;
  }

  .qr-poster__url a:hover,
  .qr-poster__url a:focus-visible {
    text-decoration: underline;
  }

  @media print {
    @page {
      size: letter;
      margin: 0.25in;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
    }

    .qr-poster {
      max-width: none;
      padding: 0;
      min-height: calc(11in - 0.5in);
    }

    .qr-poster__qr {
      box-shadow: none;
      width: calc(100% - 0.5in);
    }

    .qr-poster__title {
      font-size: clamp(2.2rem, 4vw, 3.2rem);
    }

    .qr-poster__subhead {
      font-size: 1.5rem;
    }
  }
</style>

<main class="qr-poster" role="main">
  <h1 class="qr-poster__title">FREE FEBRUARY Eagle Staff Clinics (AAA/Majors)</h1>
  <p class="qr-poster__subhead">Scan the QR code to sign up.</p>
  <ul class="qr-poster__details">
    <li><strong>Dates:</strong> Feb 7, 14, and 21, 2026</li>
    <li><strong>Time:</strong> 6:00–8:00 PM</li>
    <li><strong>Location:</strong> Robert Eagle Staff Middle School</li>
    <li>Coaches &amp; volunteers needed—use the same QR code below to sign up.</li>
  </ul>
  <img class="qr-poster__qr" src="https://ncllball.github.io/images/free-feb-clinics-qr.png" alt="QR code for Free February Eagle Staff Clinics" />
  <p class="qr-poster__url">
    Or visit:
    <a href="https://www.signupgenius.com/go/70A054FAAAF22A3F85-61675693-2026#/" target="_blank" rel="noopener noreferrer">signupgenius.com/go/70A054FAAAF22A3F85-61675693-2026</a>
  </p>
</main>

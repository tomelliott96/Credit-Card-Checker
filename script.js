// script.js

const inputField = document.getElementById("card-number");
const feedbackEl = document.getElementById("live-feedback");
const checkButton = document.getElementById("check-button");
const resultMessage = document.getElementById("result-message");
const issuerLogo = document.getElementById("issuer-logo");
const resultsSection = document.getElementById("results");
const correctionHint = document.getElementById("correction-hint");
const luhnTableBody = document.getElementById("luhn-table-body");
const sumOutput = document.getElementById("sum-output");
const breakdownSection = document.getElementById("breakdown-section");

// Live input validation
inputField.addEventListener("input", () => {
  const raw = inputField.value.replace(/\D/g, ""); // only digits
  const formatted = raw.match(/.{1,4}/g)?.join(" ") || "";
  inputField.value = formatted;

  if (/[^0-9\s]/.test(inputField.value)) {
    feedbackEl.textContent = "❌ Ungültige Zeichen – nur Zahlen erlaubt.";
    inputField.classList.add("invalid");
    inputField.classList.remove("valid");
    checkButton.disabled = true;
    return;
  }

  if (raw.length < 13) {
    feedbackEl.textContent = "ℹ️ Die Nummer ist noch zu kurz.";
    inputField.classList.add("invalid");
    inputField.classList.remove("valid");
    checkButton.disabled = true;
    return;
  }

  if (raw.length > 19) {
    feedbackEl.textContent = "❌ Die Nummer ist zu lang.";
    inputField.classList.add("invalid");
    inputField.classList.remove("valid");
    checkButton.disabled = true;
    return;
  }

  feedbackEl.textContent = "✅ Sieht gut aus!";
  inputField.classList.remove("invalid");
  inputField.classList.add("valid");
  checkButton.disabled = false;
});

// Button-Click: Luhn-Prüfung starten
checkButton.addEventListener("click", () => {
  const number = inputField.value.replace(/\s/g, "");
  const firstDigit = number[0];
  feedbackEl.textContent = "";
  inputField.classList.remove("valid", "invalid");

  if (!number) return;

  const reversed = number.split("").reverse().map(Number);
  const isValid = luhnCheck(number);

  // UI Updates
  resultsSection.hidden = false;
  breakdownSection.hidden = false;
  resultMessage.textContent = isValid
    ? "✅ Diese Kartennummer ist gültig!"
    : "❌ Diese Kartennummer ist ungültig.";
  resultMessage.className = isValid ? "valid" : "invalid";

  issuerLogo.style.display = "block";

  if (!isValid) {
    issuerLogo.src = "assets/invalid.svg";
    issuerLogo.alt = "Invalid credit card";
  } else {
    switch (firstDigit) {
      case "3":
        issuerLogo.src = "assets/amex.svg";
        issuerLogo.alt = "Amex";
        break;
      case "4":
        issuerLogo.src = "assets/visa.svg";
        issuerLogo.alt = "Visa";
        break;
      case "5":
        issuerLogo.src = "assets/mastercard.svg";
        issuerLogo.alt = "Mastercard";
        break;
      case "6":
        issuerLogo.src = "assets/discover.svg";
        issuerLogo.alt = "Discover";
        break;
      default:
        issuerLogo.src = "assets/valid-generic.svg";
        issuerLogo.alt = "Valid credit card";
    }
  }


  // Step 2: Tabelle aufbauen
  luhnTableBody.innerHTML = "";
  let sum = 0;
  reversed.forEach((digit, index) => {
    let action = "-";
    let result = digit;
    let rowClass = "";

    if (index % 2 === 1) {
      const doubled = digit * 2;
      if (doubled > 9) {
        action = `× 2 - 9`;
        result = doubled - 9;
      } else {
        action = `× 2`;
        result = doubled;
      }
      rowClass = "luhn-active-row";
    }

    sum += result;

    const row = `<tr class="${rowClass}">
      <td>${digit}</td>
      <td>${action}</td>
      <td>${result}</td>
    </tr>`;
    luhnTableBody.insertAdjacentHTML("beforeend", row);
  });

  // Summe anzeigen
  const transformedValues = reversed.map((digit, index) => {
    if (index % 2 === 1) {
      const doubled = digit * 2;
      return doubled > 9 ? doubled - 9 : doubled;
    }
    return digit;
  });
  
  sumOutput.innerHTML = `<strong>Gesamtsumme:</strong> ${transformedValues.join(" + ")} = <strong>${transformedValues.reduce((a, b) => a + b, 0)}</strong>`;

  const validityCheckEl = document.getElementById("validity-check-output");
  const modulo = sum % 10;
  validityCheckEl.innerHTML = `<strong>Calculation:</strong> ${sum} % 10 = ${modulo} → ${modulo === 0
    ? "<span class='valid'>valid ✅</span>"
    : "<span class='invalid'>invalid ❌</span>"
  }`;

  // Original & Reversed Zahl anzeigen
  const originalDigits = number.split("").join(" ");
  const reversedDigits = reversed.join(" ");
  document.getElementById("original-number").textContent = originalDigits;
  document.getElementById("reversed-number").textContent = reversedDigits;
});

// Luhn-Prüfung (identisch mit dem Check-Handler)
function luhnCheck(number) {
  const digits = number.split("").map(Number).reverse();
  const sum = digits.map((digit, index) => {
    if (index % 2 === 1) {
      const doubled = digit * 2;
      return doubled > 9 ? doubled - 9 : doubled;
    }
    return digit;
  }).reduce((acc, val) => acc + val, 0);

  return sum % 10 === 0;
}

// Prüfziffer berechnen für gültige Karten
function calculateLuhnCheckDigit(digits) {
  const fullDigits = [...digits, 0];
  const reversed = fullDigits.slice().reverse();

  const sum = reversed.map((digit, index) => {
    if (index % 2 === 1) {
      const doubled = digit * 2;
      return doubled > 9 ? doubled - 9 : doubled;
    }
    return digit;
  }).reduce((a, b) => a + b, 0);

  const mod10 = sum % 10;
  return mod10 === 0 ? 0 : 10 - mod10;
}

// Zufällige gültige Nummer generieren
function generateValidCardNumber() {
  const length = Math.floor(Math.random() * 7) + 13; // 13–19
  const digits = [];

  for (let i = 0; i < length - 1; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  const checkDigit = calculateLuhnCheckDigit(digits);
  digits.push(checkDigit);

  return formatCardNumber(digits.join(""));
}

// Ungültige Nummer generieren
function generateInvalidCardNumber() {
  const valid = generateValidCardNumber().replace(/\s/g, "");
  const digits = valid.split("").map(Number);

  const i = Math.floor(Math.random() * (digits.length - 1));
  let newDigit;
  do {
    newDigit = Math.floor(Math.random() * 10);
  } while (newDigit === digits[i]);
  digits[i] = newDigit;

  return formatCardNumber(digits.join(""));
}

// Leerzeichen einfügen für UI
function formatCardNumber(raw) {
  return raw.match(/.{1,4}/g).join(" ");
}

// Button-Events
document.getElementById("generate-valid").addEventListener("click", () => {
  const number = generateValidCardNumber();
  inputField.value = number;
  inputField.dispatchEvent(new Event("input"));
});

document.getElementById("generate-invalid").addEventListener("click", () => {
  const number = generateInvalidCardNumber();
  inputField.value = number;
  inputField.dispatchEvent(new Event("input"));
});

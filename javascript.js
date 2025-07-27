
  function calculateInvestment() {
    const P = parseFloat(document.getElementById('inv-amount').value);
    const r = parseFloat(document.getElementById('inv-rate').value) / 100;
    const t = parseFloat(document.getElementById('inv-years').value);
    const type = document.getElementById('inv-type').value;
    const n = parseInt(document.getElementById('inv-compound').value);

    if (isNaN(P) || isNaN(r) || isNaN(t) || P <= 0 || r <= 0 || t <= 0) {
      document.getElementById('investment-result').innerText = 'Please enter valid positive numbers for investment.';
      return;
    }

    let balance;
    if (type === 'compound') {
      balance = P * Math.pow(1 + r / n, n * t);
    } else {
      balance = P + P * r * t;
    }

    const interestEarned = balance - P;
    document.getElementById('investment-result').innerText =
      `Total Value: $${balance.toFixed(2)}\nInterest Earned: $${interestEarned.toFixed(2)}`;
  }

function calculateDebt() {
  const debt = parseFloat(document.getElementById('debt-amount').value);
  const annualRate = parseFloat(document.getElementById('debt-rate').value) / 100;
  const payment = parseFloat(document.getElementById('debt-payment').value);
  const payFreq = parseInt(document.getElementById('debt-payfreq').value);
  const interestType = document.getElementById('debt-type').value;
  const compoundFreq = parseInt(document.getElementById('debt-compound').value);
  const resultEl = document.getElementById('debt-result');

  if (isNaN(debt) || isNaN(annualRate) || isNaN(payment) || debt <= 0 || annualRate < 0 || payment <= 0) {
    resultEl.innerText = 'Please enter valid positive numbers.';
    return;
  }

  let balance = debt;
  let periods = 0;
  const maxIterations = 10000;
  let periodRate;
  if (interestType === 'compound') {
    const rPerCompoundingPeriod = annualRate / compoundFreq;
    const compoundPeriodsPerPayment = compoundFreq / payFreq;
    if (!Number.isFinite(compoundPeriodsPerPayment) || compoundPeriodsPerPayment <= 0) {
      resultEl.innerText = 'Invalid combination of payment and compounding frequencies.';
      return;
    }
    periodRate = Math.pow(1 + rPerCompoundingPeriod, compoundPeriodsPerPayment) - 1;
  } else {
    periodRate = annualRate / payFreq;
  }

  while (balance > 0 && periods < maxIterations) {
    if (interestType === 'compound') {
      balance *= (1 + periodRate);
    } else {
      balance += balance * periodRate;
    }

    balance -= payment;
    periods++;

    if (balance < 0) balance = 0;
  }

  if (periods === maxIterations) {
    resultEl.innerText = 'Payment too low to ever pay off debt.';
    return;
  }

  const totalPaid = periods * payment;
  const freqNames = {365: 'day(s)', 52: 'week(s)', 26: 'bi-week(s)', 12: 'month(s)', 1: 'year(s)'};
  const years = Math.floor(periods / payFreq);
  const remPeriods = periods % payFreq;

  resultEl.innerText =
    `Debt paid off in: ${years} ${freqNames[payFreq]} and ${remPeriods} ${freqNames[payFreq]}\nTotal paid: $${totalPaid.toFixed(2)}`;
}

  function calculateEMI() {
    const loanAmount = parseFloat(document.getElementById('emi-loan').value);
    const annualRate = parseFloat(document.getElementById('emi-rate').value) / 100;
    const years = parseFloat(document.getElementById('emi-years').value);
    const payFreq = parseInt(document.getElementById('emi-payfreq').value);
    const interestType = document.getElementById('emi-type').value;
    const compoundFreq = parseInt(document.getElementById('emi-compound').value);

    if (isNaN(loanAmount) || isNaN(annualRate) || isNaN(years) || loanAmount <= 0 || annualRate < 0 || years <= 0) {
      document.getElementById('emi-result').innerText = 'Please enter valid positive numbers.';
      return;
    }

    const totalPayments = years * payFreq;
    let emi = 0;

    if (interestType === 'compound') {
      // Effective periodic interest rate
      const periodRate = Math.pow(1 + annualRate / compoundFreq, compoundFreq / payFreq) - 1;
      emi = (loanAmount * periodRate) / (1 - Math.pow(1 + periodRate, -totalPayments));
    } else {
      // Simple interest total + principal divided equally
      const totalInterest = loanAmount * annualRate * years;
      emi = (loanAmount + totalInterest) / totalPayments;
    }

    document.getElementById('emi-result').innerText =
      `EMI per payment period: $${emi.toFixed(2)}\nTotal Payments: ${totalPayments}\nTotal Amount Paid: $${(emi * totalPayments).toFixed(2)}`;
  }

  async function convertCurrency() {
    const amount = parseFloat(document.getElementById('curr-amount').value);
    const from = document.getElementById('curr-from').value;
    const to = document.getElementById('curr-to').value;
    const resultEl = document.getElementById('currency-result');

    if (isNaN(amount) || amount <= 0) {
      resultEl.innerText = 'Please enter a valid positive amount.';
      return;
    }

    if (from === to) {
      resultEl.innerText = `${amount.toFixed(2)} ${from} = ${amount.toFixed(2)} ${to}`;
      return;
    }

    resultEl.innerText = 'Converting...';

    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const data = await response.json();

      if (!data.rates || !data.rates[to]) {
        throw new Error('Currency not supported.');
      }

      const rate = data.rates[to];
      const converted = amount * rate;

      resultEl.innerText = `${amount.toFixed(2)} ${from} = ${converted.toFixed(4)} ${to}`;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      resultEl.innerText = 'Conversion failed. Please try again later.';
    }
  }
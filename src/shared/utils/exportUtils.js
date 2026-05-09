import html2pdf from 'html2pdf.js';

/**
 * 匯出交易紀錄為 PDF (字體放大版)
 * 要求：字體統一放大 1 倍 (x2)
 */
export const exportToPDF = (transactions, t, currency) => {
  const element = document.createElement('div');
  element.style.padding = '40px';
  element.style.fontFamily = '"PingFang TC", "Microsoft JhengHei", "Helvetica", sans-serif';
  element.style.color = '#000';
  element.style.backgroundColor = '#fff';
  element.style.lineHeight = '1.4';

  // 1. 大標 (H1 x2)
  const header = `
    <div style="border-bottom: 4px solid #000; margin-bottom: 40px; padding-bottom: 20px;">
      <h1 style="font-size: 56px; font-weight: bold; margin: 0;">Boreal 財務報表</h1>
      <p style="font-size: 24px; color: #666; margin-top: 10px;">產生時間：${new Date().toLocaleString()}</p>
    </div>
  `;

  // 2. 中標與摘要 (H2 x2, Text x2)
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const summary = `
    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 40px; font-weight: bold; margin-bottom: 30px; border-left: 8px solid #333; padding-left: 20px;">收支摘要</h2>
      
      <div style="display: flex; gap: 60px;">
        <div>
          <h3 style="font-size: 28px; font-weight: bold; color: #333; margin: 0;">總收入</h3>
          <p style="font-size: 32px; margin: 10px 0;">+${totalIncome}</p>
        </div>
        <div>
          <h3 style="font-size: 28px; font-weight: bold; color: #333; margin: 0;">總支出</h3>
          <p style="font-size: 32px; margin: 10px 0;">-${totalExpense}</p>
        </div>
        <div>
          <h3 style="font-size: 28px; font-weight: bold; color: #333; margin: 0;">淨收支</h3>
          <p style="font-size: 32px; margin: 10px 0; font-weight: bold;">${totalIncome - totalExpense}</p>
        </div>
      </div>
    </div>
  `;

  // 3. 交易明細 (Table Text x2)
  let tableRows = '';
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedTransactions.forEach(tx => {
    tableRows += `
      <tr style="border-bottom: 2px solid #eee;">
        <td style="padding: 20px 10px; font-size: 24px;">${tx.date}</td>
        <td style="padding: 20px 10px; font-size: 24px;">${t(`categories.${tx.category}`) || tx.category}</td>
        <td style="padding: 20px 10px; font-size: 24px; color: #666; text-align: right;">
          ${tx.type === 'expense' ? '-' : '+'}${tx.amount}
        </td>
      </tr>
    `;
  });

  const detail = `
    <div>
      <h2 style="font-size: 40px; font-weight: bold; margin-bottom: 30px; border-left: 8px solid #333; padding-left: 20px;">交易明細</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 4px solid #333;">
            <th style="padding: 20px 10px; text-align: left; font-size: 28px;">日期</th>
            <th style="padding: 20px 10px; text-align: left; font-size: 28px;">類別</th>
            <th style="padding: 20px 10px; text-align: right; font-size: 28px;">金額</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  // 組合
  element.innerHTML = header + summary + detail;

  const opt = {
    margin:       [10, 10],
    filename:     `Boreal_Report_Large_${new Date().toISOString().split('T')[0]}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};

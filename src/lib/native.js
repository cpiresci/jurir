export const isNative = () => {
  try { return typeof window !== 'undefined' && !!window.JuriShareBridge; }
  catch { return false; }
};
export async function downloadOrSharePdf(blob, filename = 'jurir-analise.pdf') {
  if (isNative() && window.JuriShareBridge) {
    const reader = new FileReader();
    reader.onloadend = () => window.JuriShareBridge.shareImage(reader.result.split(',')[1], 'application/pdf', filename);
    reader.readAsDataURL(blob);
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }
}
export async function downloadOrShareDocx(blob, filename = 'jurir-peticao.docx') {
  if (isNative() && window.JuriShareBridge) {
    const reader = new FileReader();
    reader.onloadend = () => window.JuriShareBridge.shareImage(reader.result.split(',')[1], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename);
    reader.readAsDataURL(blob);
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }
}
export function openExternalLink(url) {
  if (isNative() && window.JuriShareBridge) window.JuriShareBridge.openExternalUrl(url);
  else window.open(url, '_blank', 'noopener,noreferrer');
}

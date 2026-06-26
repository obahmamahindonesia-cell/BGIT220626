export function normalizeIndonesianTranscript(transcript: string): string {
  let text = transcript.trim()

  text = text.replace(/Rp\s*([\d.]+)/g, (_, amount) => {
    const clean = amount.replace(/\./g, '')
    return `rupiah ${clean}`
  })

  text = text.replace(/\b(\d{1,2})\.(\d{2})\b/g, (_, h, m) => {
    if (parseInt(h) >= 0 && parseInt(h) <= 23 && parseInt(m) >= 0 && parseInt(m) <= 59) {
      if (m === '00') return `${h} tepat`
      return `${h} lebih ${m}`
    }
    return `${h} koma ${m}`
  })

  text = text.replace(/\b(\d+)%/g, (_, n) => `${n} persen`)

  text = text.replace(/(\d)(\s*)-(\s*)(\d)/g, '$1 sampai $4')

  text = text.replace(/\+\s*(\d+)/g, 'plus $1')
  text = text.replace(/(\d+)\s*\+\s*(\d+)/g, '$1 ditambah $2')
  text = text.replace(/(\d+)\s*-\s*(\d+)/g, '$1 kurangi $2')
  text = text.replace(/=/g, ' sama dengan ')

  text = text.replace(/\b(\d+)\b/g, (match) => {
    if (match.length > 9) return match
    const n = parseInt(match, 10)
    if (isNaN(n)) return match
    return numberToIndonesian(n)
  })

  text = text.replace(/"(.*?)"/g, ' tanda kutip $1 tanda kutip ')
  text = text.replace(/[•·]/g, ', ')
  text = text.replace(/\.\.\./g, ' ... ')
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

function numberToIndonesian(n: number): string {
  const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan']

  if (n === 0) return 'nol'

  function convertBelow1000(num: number): string {
    if (num === 0) return ''
    if (num < 10) return units[num]
    if (num < 20) {
      if (num === 10) return 'sepuluh'
      if (num === 11) return 'sebelas'
      return units[num % 10] + ' belas'
    }
    if (num < 100) {
      const t = Math.floor(num / 10)
      const u = num % 10
      if (t === 1) return 'sepuluh'
      const prefix = t === 1 ? 'se' : units[t]
      return prefix + ' puluh' + (u > 0 ? ' ' + units[u] : '')
    }
    const h = Math.floor(num / 100)
    const rest = num % 100
    const prefix = h === 1 ? 'seratus' : units[h] + ' ratus'
    return prefix + (rest > 0 ? ' ' + convertBelow1000(rest) : '')
  }

  const billions = Math.floor(n / 1000000000)
  const millions = Math.floor((n % 1000000000) / 1000000)
  const thousands = Math.floor((n % 1000000) / 1000)
  const remainder = n % 1000

  const parts: string[] = []
  if (billions > 0) parts.push(convertBelow1000(billions) + ' milyar')
  if (millions > 0) parts.push(convertBelow1000(millions) + ' juta')
  if (thousands > 0) parts.push(convertBelow1000(thousands) + ' ribu')
  if (remainder > 0) parts.push(convertBelow1000(remainder))

  return parts.join(' ')
}

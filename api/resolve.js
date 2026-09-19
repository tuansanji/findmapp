export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: 'Thiếu URL' });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow'
    });

    const finalUrl = response.url || '';
    const htmlContent = await response.text();
    const combinedText = finalUrl + " " + htmlContent;

    let lat = null, lng = null;
    const matchAt = combinedText.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (matchAt) {
      lat = parseFloat(matchAt[1]);
      lng = parseFloat(matchAt[2]);
    } else {
      const matchData = combinedText.match(/(!3d|q=|center=)(-?\d+\.\d+)(!4d|,|%2C)(-?\d+\.\d+)/);
      if (matchData) {
        lat = parseFloat(matchData[2]);
        lng = parseFloat(matchData[4]);
      }
    }

    if (lat !== null && lng !== null) {
      return res.status(200).json({ success: true, lat, lng });
    }
    return res.status(404).json({ success: false, error: 'Không tìm thấy tọa độ' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
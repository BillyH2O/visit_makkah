import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [depositEnabledSetting, depositPercentSetting] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: 'depositEnabled' } }),
      prisma.siteSetting.findUnique({ where: { key: 'depositPercent' } }),
    ])
    
    const depositEnabled = depositEnabledSetting?.value != null ? depositEnabledSetting.value === 'true' : true
    const depositPercentRaw = depositPercentSetting?.value != null ? Number.parseFloat(depositPercentSetting.value) : 20
    const depositPercent = Number.isFinite(depositPercentRaw) ? Math.min(100, Math.max(1, Math.round(depositPercentRaw))) : 20
    
    return Response.json({ depositEnabled, depositPercent })
  } catch {
    return Response.json({ depositEnabled: true, depositPercent: 20 }, { status: 200 })
  }
}







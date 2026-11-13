import { revalidatePath } from 'next/cache'

export function revalidateCampusData() {
  try {
    revalidatePath('/', 'page')
    revalidatePath('/lost', 'page')
    revalidatePath('/found', 'page')
    revalidatePath('/claims', 'page')
    revalidatePath('/my-reports', 'page')
    revalidatePath('/admin/dashboard', 'page')
  } catch (err) {
    // Next.js revalidatePath may throw in certain edge environments; safely catch
    console.warn('revalidateCampusData warning:', err.message)
  }
}

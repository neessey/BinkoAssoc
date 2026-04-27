'use server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateAdminPassword(formData: FormData) {
    const newPassword = formData.get('newPassword') as string
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email administrateur introuvable.' }
    }
    if (!newPassword || newPassword.length < 8) {
        return { error: 'Le mot de passe doit faire au moins 8 caractères.' }
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        const { error } = await supabase
            .from('admins')
            .update({ password_hash: hashedPassword })
            .eq('email', email)

        if (error) {
            console.error('Supabase error:', error)
            return { error: `Erreur base de données : ${error.message}` }
        }

        return { success: true }
    } catch (err) {
        console.error('Server error:', err)
        return { error: 'Erreur interne du serveur.' }
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';


const allowedRoles = new Set(['seeker', 'recruiter']);

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbnNheWxvcnFrbmJlZ21oaWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTg4MTgxNywiZXhwIjoyMTA3NDU3ODE3fQ.n4txNTA8XHX32M9jlOCf_03RBaOmMBIgFaTFxdaQWvk') {
    return NextResponse.json(
      { error: 'Server authentication is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.' },
      { status: 500 },
    );
  }

  try {
    const { name, email, phone, password, role } = await req.json() as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
    };

    const normalizedEmail = email?.toLowerCase().trim();
    if (!name?.trim() || !normalizedEmail || !password || !allowedRoles.has(role ?? '')) {
      return NextResponse.json({ error: 'Name, email, password, and a valid role are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    let userId: string | null = null;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: name.trim(), phone: phone?.trim() ?? '', role },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        const { data: list } = await supabaseAdmin.auth.admin.listUsers();
        const existing = list?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);
        if (existing) {
          userId = existing.id;
          await supabaseAdmin.auth.admin.updateUserById(existing.id, { password, user_metadata: { name: name.trim(), phone: phone?.trim() ?? '', role } });
        }
        else return NextResponse.json({ error: error.message }, { status: 409 });
      } else {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else {
      userId = data.user?.id ?? null;
    }
    if (!userId) {
      return NextResponse.json({ error: 'Supabase did not create the account.' }, { status: 500 });
    }

    return NextResponse.json({ user: { id: userId, email: normalizedEmail } }, { status: 201 });
  } catch (error) {
    console.error('register error:', error);
    return NextResponse.json({ error: 'Invalid registration request.' }, { status: 400 });
  }
}



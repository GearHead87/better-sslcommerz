'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
// import { FcGoogle } from 'react-icons/fc';
// import { socialLogin } from '@/lib/action';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth-client';

const signupSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email(),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirm: z.string().min(8, 'Confirm your password'),
    })
    .refine((data) => data.password === data.confirm, {
        message: 'Passwords do not match',
        path: ['confirm'],
    });

export default function SignupForm() {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema as never) as never,
        defaultValues: { name: '', email: '', password: '', confirm: '' },
        mode: 'onChange',
    });
    const [loading, setLoading] = useState(false);

    const onSubmit = async (values: z.infer<typeof signupSchema>) => {
        try {
            setLoading(true);
            const { data, error } = await authClient.signUp.email(
                {
                    email: values.email, // user email address
                    password: values.password, // user password -> min 8 characters by default
                    name: values.name, // user display name
                    callbackURL: '/dashboard', // redirect after verification
                },
                {
                    onRequest: (ctx) => {
                        //show loading
                        toast.loading('Creating account...');
                    },
                    onSuccess: (ctx) => {
                        toast.success('Account created. Please verify your email to sign in.');
                    },
                    onError: (ctx) => {
                        // display the error message
                        toast.error(ctx.error.message);
                    },
                },
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">Or</span>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="Jane Doe"
                        required
                        aria-invalid={!!errors.name}
                        {...register('name')}
                    />
                    {errors.name?.message ? (
                        <p className="text-destructive mt-1 text-xs">{errors.name.message}</p>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        aria-invalid={!!errors.email}
                        {...register('email')}
                    />
                    {errors.email?.message ? (
                        <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        aria-invalid={!!errors.password}
                        {...register('password')}
                    />
                    {errors.password?.message ? (
                        <p className="text-destructive mt-1 text-xs">{errors.password.message}</p>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input
                        id="confirm"
                        type="password"
                        placeholder="••••••••"
                        required
                        aria-invalid={!!errors.confirm}
                        {...register('confirm')}
                    />
                    {errors.confirm?.message ? (
                        <p className="text-destructive mt-1 text-xs">{errors.confirm.message}</p>
                    ) : null}
                </div>
                <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
                    {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    {loading ? 'Creating account...' : 'Create account'}
                </Button>
            </form>
        </div>
    );
}

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black selection:bg-purple-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-purple-900 dark:mix-blend-normal" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-pink-900 dark:mix-blend-normal" />
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-blue-900 dark:mix-blend-normal" />

      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  );
}

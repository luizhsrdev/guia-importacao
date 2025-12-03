import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import AdminLink from '@/components/AdminLink';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">
            Planilha do Sena
          </h1>

          <div className="flex gap-4 items-center">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-surface border border-primary text-primary rounded-lg hover:bg-primary hover:text-background transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <AdminLink />
              <UserButton />
            </SignedIn>
          </div>
        </div>

        <p className="text-textSecondary">
          Plataforma em desenvolvimento...
        </p>
      </div>
    </main>
  );
}

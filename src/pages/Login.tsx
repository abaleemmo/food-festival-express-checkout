import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-festival-cream text-festival-charcoal-gray">
      <div className="w-full max-w-md p-8 bg-festival-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-festival-dark-red">
          Welcome Back!
        </h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // No third-party providers for now
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--festival-deep-orange))',
                  brandAccent: 'hsl(var(--festival-forest-green))',
                  inputBackground: 'hsl(var(--festival-cream))',
                  inputBorder: 'hsl(var(--festival-forest-green))',
                  inputBorderHover: 'hsl(var(--festival-deep-orange))',
                  inputBorderFocus: 'hsl(var(--festival-deep-orange))',
                  inputText: 'hsl(var(--festival-charcoal-gray))',
                },
              },
            },
          }}
          theme="light"
        />
      </div>
    </div>
  );
};

export default Login;
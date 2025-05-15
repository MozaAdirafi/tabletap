// // src/app/auth/login/page.tsx
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
// import { Alert } from '@/components/ui/Alert';

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
  
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);
    
//     try {
//       // In a real app, this would call your auth API
//       if (email === 'demo@tabletap.com' && password === 'password') {
//         // Set cookies or local storage with auth token
//         // document.cookie = 'auth_token=demo_token; path=/;';
        
//         // Redirect to admin dashboard
//         router.push('/admin/dashboard');
//       } else {
//         setError('Invalid email or password. Try using demo@tabletap.com / password.');
//       }
//     } catch (err) {
//       setError('An error occurred during login. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">TableTap</h1>
//           <h2 className="text-center text-xl font-semibold text-gray-600">Sign in to your account</h2>
//         </div>
        
//         <Card>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <CardContent className="pt-6">
//               {error && (
//                 <Alert variant="error" className="mb-4">
//                   {error}
//                 </Alert>
//               )}
              
//               <div className="space-y-4">
//                 <Input
//                   id="email"
//                   label="Email Address"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   fullWidth
//                 />
                
//                 <Input
//                   id="password"
//                   label="Password"
//                   type="password"
//                   autoComplete="current-password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   fullWidth
//                 />
//               </div>
              
//               <div className="flex items-center justify-between mt-4">
//                 <div className="flex items-center">
//                   <input
//                     id="remember-me"
//                     name="remember-me"
//                     type="checkbox"
//                     className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                     Remember me
//                   </label>
//                 </div>
                
//                 <div className="text-sm">
//                   <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
//                     Forgot your password?
//                   </Link>
//                 </div>
//               </div>
//             </CardContent>
            
//             <CardFooter className="bg-gray-50 border-t px-6 py-4">
//               <Button
//                 type="submit"
//                 variant="primary"
//                 isLoading={isLoading}
//                 fullWidth
//               >
//                 Sign in
//               </Button>
//             </CardFooter>
//           </form>
//         </Card>
        
//         <div className="text-center">
//           <p className="text-sm text-gray-600">
//             Dont have an account?{' '}
//             <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
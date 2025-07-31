# Realtime Social Networking App

A modern social networking application built with Next.js, Supabase, and realtime features. This app demonstrates real-time updates, user authentication, and social media functionality.

## Features

- 🔐 **Authentication**: Email/password and magic link authentication with Supabase Auth
- 📱 **Realtime Updates**: Live feed updates using Supabase Realtime
- 👥 **User Profiles**: User profiles with avatars and bio
- 📝 **Posts**: Create, read, update, and delete posts
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🔒 **Security**: Row Level Security (RLS) policies for data protection
- ⚡ **Performance**: Server-side rendering with Next.js 15

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd realtime-supabase
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy the environment variables from `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL commands from `supabase/schema.sql`

### 5. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Main dashboard page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── CreatePost.tsx     # Post creation component
│   ├── RealtimeFeed.tsx   # Realtime feed component
│   └── UserProfile.tsx    # User profile component
├── lib/                   # Utility libraries
│   └── supabase/          # Supabase client configurations
├── middleware.ts          # Next.js middleware for auth
├── supabase/              # Database schema
└── env.example            # Environment variables template
```

## Key Features Explained

### Realtime Updates

The app uses Supabase Realtime to provide live updates:

```typescript
// Subscribe to post changes
const channel = supabase
  .channel('posts')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'posts',
    },
    (payload) => {
      // Handle realtime updates
    }
  )
  .subscribe()
```

### Presence System

Track online users in real-time:

```typescript
// Track user presence
const roomChannel = supabase.channel('online-users')
roomChannel
  .on('presence', { event: 'sync' }, () => {
    const presenceState = roomChannel.presenceState()
    // Handle presence updates
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await roomChannel.track({
        id: user.id,
        username: user.username,
        online_at: new Date().toISOString(),
      })
    }
  })
```

### Broadcast Messaging

Real-time chat functionality:

```typescript
// Send broadcast message
await channel.send({
  type: 'broadcast',
  event: 'message',
  payload: {
    message: 'Hello world!',
    username: 'user123',
  },
})

// Listen for broadcast messages
channel.on('broadcast', { event: 'message' }, (payload) => {
  console.log('Received:', payload.payload)
})
```

### Authentication Flow

1. **Middleware**: Protects routes and manages sessions
2. **Server Components**: Handle authentication on the server
3. **Client Components**: Manage user interactions

### Database Schema

- **posts**: Stores user posts with realtime capabilities
- **profiles**: User profile information
- **RLS Policies**: Secure data access based on user authentication

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Open an issue in this repository

## Roadmap

- [ ] Add comments to posts
- [ ] Implement user following system
- [ ] Add image uploads
- [ ] Create mobile app
- [ ] Add notifications
- [ ] Implement search functionality

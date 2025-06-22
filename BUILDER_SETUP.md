# Builder.io React SDK Setup

## Installation ✅

The Builder.io React SDK has been successfully installed:

```bash
npm install @builder.io/react
```

## Environment Configuration ✅

### API Key Setup

1. **Environment Variables**: Added to `.env` file in the project root:

   ```env
   # Builder.io Configuration
   REACT_APP_BUILDER_API_KEY=your_key_here
   VITE_BUILDER_API_KEY=your_key_here
   ```

2. **Replace Placeholder**: Update `your_key_here` with your actual Builder.io API key

3. **Getting Your API Key**:
   - Log in to your Builder.io account
   - Go to Account Settings → API Keys
   - Copy your Public API Key
   - Replace `your_key_here` in the `.env` file

### Vite Environment Variables

**Important Note**: This project uses Vite (not Create React App), so:

- ✅ **Recommended**: Use `VITE_BUILDER_API_KEY` (Vite standard)
- ✅ **Supported**: `REACT_APP_BUILDER_API_KEY` (for compatibility)
- Both variables are supported in the configuration

## Usage

### Basic Setup

```typescript
import { Builder } from "@builder.io/react";
import { builderConfig } from "@/config/builder";

// Initialize Builder.io
Builder.init(builderConfig.apiKey);
```

### Configuration Utility

The project includes a configuration utility at `src/config/builder.ts`:

```typescript
import { builderConfig, initBuilder } from "@/config/builder";

// Initialize Builder.io (recommended in main.tsx or App.tsx)
initBuilder();

// Access API key
const apiKey = builderConfig.apiKey;
```

### Environment Variable Access

The configuration supports multiple ways to access the API key:

```typescript
// In Vite project (recommended)
const apiKey = import.meta.env.VITE_BUILDER_API_KEY;

// For compatibility with React App setup
const apiKey = import.meta.env.REACT_APP_BUILDER_API_KEY;

// Using the config utility (recommended)
import { builderConfig } from "@/config/builder";
const apiKey = builderConfig.apiKey;
```

## Routes Setup ✅

### Available Builder.io Routes

1. **Public Home Page**: `/home`

   - Accessible without authentication
   - Uses `<BuilderComponent model="page" />`
   - Perfect for landing pages and marketing content

2. **Admin Builder Page**: `/admin/builder`

   - Requires admin authentication
   - Includes user context for personalization
   - URL path: `/admin/builder`

3. **User Builder Page**: `/user/builder`
   - Requires user authentication
   - Includes user context for personalization
   - URL path: `/user/builder`

### Builder.io Dashboard Setup

To create content for these routes:

1. **Login to Builder.io Dashboard**
2. **Create a new Page model**
3. **Set the URL targeting**:
   - For `/home`: Set URL to `/home`
   - For admin content: Set URL to `/admin/builder`
   - For user content: Set URL to `/user/builder`
4. **Design your content** using the visual editor
5. **Publish** to see it live

### User Personalization ✅

The protected routes (admin/user) automatically pass user context:

```javascript
{
  userId: user.id,
  userName: user.name,
  userRole: user.role,
  userEmail: user.email,
  userDepartment: user.department,
  urlPath: "/admin/builder" // or "/user/builder"
}
```

## Next Steps

1. **Replace API Key**: Update `.env` file with your actual Builder.io API key
2. **Create Content**: Use Builder.io dashboard to create page content
3. **Test Routes**: Visit `/home`, `/admin/builder`, `/user/builder`
4. **Customize**: Add custom components and personalization

### Quick Test

1. Start your development server: `npm run dev`
2. Visit `http://localhost:8080/home` to see the public Builder.io page
3. Login and visit `/admin/builder` or `/user/builder` for authenticated content

## Security Notes

- ✅ API key is safely stored in environment variables
- ✅ Variables are loaded at build time (not runtime)
- ✅ `.env` file should be added to `.gitignore` for production keys
- ✅ Both Vite and React App variable formats supported

## Troubleshooting

### API Key Not Found

If you see the warning "Builder.io API key not found":

1. Check that `.env` file exists in project root
2. Verify the API key is correctly set (no quotes needed)
3. Restart the development server after updating `.env`
4. Check console for validation messages

### Environment Variable Not Loading

For Vite projects:

- Use `VITE_` prefix for environment variables
- Access with `import.meta.env.VITE_VARIABLE_NAME`
- Restart dev server after changes to `.env`

# Dynamic Form Builder

A full-stack web application that allows administrators to create dynamic forms with various field types, and enables users to fill and submit those forms. Form submissions are stored in a database and can be viewed by administrators.

## Features

### Admin Features
- Create, edit, and delete forms
- Add fields to forms with various types (text, textarea, number, email, date, checkbox, radio, select, file)
- Configure field properties (label, name, required, validation rules)
- Add options for radio, select, and checkbox fields
- Add nested/conditional fields for radio and select options
- Reorder fields using drag-and-drop
- View form submissions with pagination and filtering
- Form versioning (automatic versioning when forms are updated)
- Simple token-based authentication

### Public Features
- View list of available forms
- Fill and submit forms dynamically
- Client-side and server-side validation
- Real-time error messages

### Technical Features
- RESTful API with Express.js
- MongoDB database with Mongoose
- React frontend with routing
- Input sanitization and validation
- Rate limiting for API protection
- CORS enabled
- Security headers with Helmet

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

## Installation

1. Clone the repository or navigate to the project directory.

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

Or install all dependencies at once:
```bash
npm run install-all
```

4. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dynamic-forms
JWT_SECRET=your-secret-key-change-this-in-production
ADMIN_TOKEN=admin-secret-token-change-this
```

5. Make sure MongoDB is running on your system. If MongoDB is not installed locally, you can use MongoDB Atlas (cloud) and update the `MONGODB_URI` in the `.env` file.

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm run dev
```
The server will start on `http://localhost:5000`

2. In a separate terminal, start the React development server:
```bash
npm run client
```
The client will start on `http://localhost:3000`

### Production Mode

1. Build the React app:
```bash
cd client
npm run build
cd ..
```

2. Set the environment variable:
```bash
set NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

The application will be available on `http://localhost:5000`

## API Endpoints

### Public Endpoints

- `GET /api/forms` - Get list of all forms
- `GET /api/forms/:id` - Get form definition by ID
- `POST /api/submissions` - Submit a form response

### Admin Endpoints (Requires Admin Token)

All admin endpoints require the `x-admin-token` header or `token` query parameter.

#### Forms
- `GET /api/admin/forms` - Get all forms (admin view)
- `GET /api/admin/forms/:id` - Get form by ID
- `POST /api/admin/forms` - Create a new form
- `PUT /api/admin/forms/:id` - Update a form
- `DELETE /api/admin/forms/:id` - Delete a form

#### Fields
- `POST /api/admin/forms/:id/fields` - Add a field to a form
- `PUT /api/admin/forms/:id/fields/:fieldId` - Update a field
- `DELETE /api/admin/forms/:id/fields/:fieldId` - Delete a field
- `PUT /api/admin/forms/:id/fields/reorder` - Reorder fields

#### Submissions
- `GET /api/submissions` - Get all submissions (supports pagination and filtering)
  - Query params: `page`, `limit`, `formId`, `startDate`, `endDate`
- `GET /api/submissions/form/:formId` - Get submissions for a specific form (supports pagination and filtering)
  - Query params: `page`, `limit`, `startDate`, `endDate`
- `GET /api/submissions/:id` - Get a specific submission (uses form snapshot for display)

## Usage

### Admin Panel

1. Navigate to `http://localhost:3000/admin` (or the admin route)
2. Enter the admin token (from your `.env` file) to login
3. Create a new form by clicking "Create Form"
4. Add fields to your form by clicking "Manage Fields"
5. Configure each field:
   - Set label and name
   - Choose field type
   - Mark as required if needed
   - Add options for radio/select/checkbox fields
   - Set validation rules (min/max, pattern, etc.)
6. Reorder fields by dragging them
7. View submissions in the "Submissions" tab

### Public Forms

1. Navigate to `http://localhost:3000` (home page)
2. View available forms
3. Click "Fill Form" to open a form
4. Fill in the form fields
5. Submit the form
6. View success message

## Field Types

- **Text**: Single-line text input
- **Textarea**: Multi-line text input
- **Number**: Numeric input with min/max validation
- **Email**: Email input with email validation
- **Date**: Date picker
- **Checkbox**: Multiple selection from options
- **Radio**: Single selection from options (supports nested fields)
- **Select**: Dropdown selection from options (supports nested fields)
- **File Upload**: File upload field with type and size validation (stored as base64)

## Bonus Features

### File Upload Support
- Files are stored as base64 strings in the database
- Configurable allowed file types (MIME types)
- Configurable maximum file size
- File download support in submission view

### Form Versioning
- Forms are automatically versioned when fields are modified
- Each submission stores the form version and snapshot
- Older submissions retain their original form schema for accurate data display
- Form version is displayed in the admin panel

### Pagination & Filtering
- Paginated submission lists (configurable page size)
- Filter submissions by form
- Filter submissions by date range (start date, end date)
- Navigate through pages with Previous/Next buttons
- Display total count and current page information

## Validation

The application supports both client-side and server-side validation:

- **Required fields**: Validated on both client and server
- **Email**: Email format validation
- **Number**: Min/max value validation
- **Text/Textarea**: Min/max length and pattern (regex) validation
- **Radio/Select/Checkbox**: Option validation

## Security

- Input sanitization to prevent injection attacks
- Token-based authentication for admin routes
- Rate limiting on API endpoints
- Security headers with Helmet
- CORS configuration
- Input validation and error handling

## Database Schema

### Form
```javascript
{
  title: String,
  description: String,
  fields: [Field],
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Field
```javascript
{
  label: String,
  type: String (enum: text, textarea, number, email, date, checkbox, radio, select, file),
  name: String (unique within form),
  required: Boolean,
  options: [{ 
    label: String, 
    value: String,
    nestedFields: [Field] // For radio/select options
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    minLength: Number,
    maxLength: Number,
    allowedTypes: [String], // For file fields
    maxSize: Number // For file fields (in bytes)
  },
  order: Number
}
```

### Submission
```javascript
{
  formId: ObjectId (reference to Form),
  answers: Map,
  submittedAt: Date,
  ip: String,
  userAgent: String
}
```

## Testing

### Manual Testing

1. **Create a Form**:
   - Login to admin panel
   - Create a new form with title and description
   - Verify form appears in the list

2. **Add Fields**:
   - Click "Manage Fields" on a form
   - Add various field types
   - Test adding options for radio/select/checkbox
   - Verify field ordering with drag-and-drop

3. **Submit Form**:
   - Navigate to home page
   - Click on a form
   - Fill in the form
   - Submit and verify success message

4. **View Submissions**:
   - Login to admin panel
   - Go to Submissions tab
   - Verify submitted data is displayed

### API Testing

You can test the API using tools like Postman or curl:

```bash
# Get all forms (public)
curl http://localhost:5000/api/forms

# Create a form (admin)
curl -X POST http://localhost:5000/api/admin/forms \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token" \
  -d '{"title": "Test Form", "description": "A test form"}'

# Submit a form (public)
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"formId": "form-id", "answers": {"field1": "value1"}}'
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check MongoDB service
- Verify `MONGODB_URI` in `.env` file is correct
- Check MongoDB logs for connection errors

### Port Already in Use
- Change the `PORT` in `.env` file
- Or kill the process using the port

### Admin Token Not Working
- Verify the `ADMIN_TOKEN` in `.env` matches the token you're using
- Check that the token is being sent in the request headers

### CORS Errors
- Ensure the backend is running on the correct port
- Check CORS configuration in `server.js`

## Project Structure

```
.
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/     # Admin components
│   │   │   └── Public/    # Public components
│   │   ├── services/      # API services
│   │   └── App.js
│   └── package.json
├── models/                 # Mongoose models
│   ├── Form.js
│   └── Submission.js
├── routes/                 # Express routes
│   ├── admin.js
│   ├── forms.js
│   └── submissions.js
├── middleware/             # Express middleware
│   ├── auth.js
│   └── validation.js
├── server.js              # Express server
├── package.json
└── README.md
```

## License

ISC

## Author

Built for Ahead WebSoft Technologies


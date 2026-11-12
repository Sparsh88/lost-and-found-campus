import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration / Staff ID is required'],
      trim: true,
      uppercase: true,
    },
    // Preserved alias for compatibility with earlier references
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'security', 'admin'],
      default: 'student',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    karmaPoints: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.index(
  { registrationNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      registrationNumber: { $type: 'string', $gt: '' },
    },
  }
)

UserSchema.pre('validate', function syncStudentId() {
  if (this.registrationNumber && !this.studentId) {
    this.studentId = this.registrationNumber
  } else if (!this.registrationNumber && this.studentId) {
    this.registrationNumber = this.studentId
  }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)

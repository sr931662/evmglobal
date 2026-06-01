import 'dotenv/config'
import mongoose from 'mongoose'
import { PackageSchema } from '../src/modules/packages/schemas/package.schema'

// Default images for different package types
const imageMap: Record<string, string> = {
  'Honeymoon': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1200&h=630',
  'Family': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200&h=630',
  'Luxury': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200&h=630',
  'Domestic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200&h=630',
  'Wellness': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200&h=630',
}

async function migrateImages() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL
    if (!mongoUri) {
      console.error('MONGODB_URI or DATABASE_URL not set')
      process.exit(1)
    }

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    const packageModel = mongoose.model('Package', PackageSchema)

    // Find all packages without images or with empty images and return plain objects
    const packages = await packageModel.find({
      $or: [
        { image: { $exists: false } },
        { image: '' },
        { image: null },
      ],
    }).lean().exec()

    console.log(`Found ${packages.length} packages without images`)

    if (packages.length === 0) {
      console.log('All packages already have images!')
      await mongoose.connection.close()
      return
    }

    // Update each package with a default image based on category
    for (const pkg of packages) {
      const category = (pkg as any).category || 'Domestic'
      const image = imageMap[category] || imageMap['Domestic']
      await packageModel.updateOne(
        { _id: (pkg as any)._id },
        { image }
      )
      console.log(`Updated: ${ (pkg as any).title } (${category}) with image`)
    }

    console.log(`✓ Successfully updated ${packages.length} packages with images`)
    await mongoose.connection.close()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateImages()

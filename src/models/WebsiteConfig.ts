import mongoose, { Schema, Document } from 'mongoose';

export interface IWebsiteConfig extends Document {
  siteName: string;
  logo: string;
  favicon: string;

  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };

  socialLinks: {
    facebook?: string;
    youtube?: string;
    zalo?: string;
    instagram?: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

const WebsiteConfigSchema: Schema = new Schema<IWebsiteConfig>(
  {
    siteName: { type: String, required: true },
    logo: { type: String, required: true },
    favicon: { type: String, required: true },

    contact: {
      phone: { type: String },
      email: { type: String },
      address: { type: String },
    },

    socialLinks: {
      facebook: { type: String },
      youtube: { type: String },
      zalo: { type: String },
      instagram: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.WebsiteConfig ||
  mongoose.model<IWebsiteConfig>('WebsiteConfig', WebsiteConfigSchema);

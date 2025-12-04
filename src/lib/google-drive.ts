/**
 * Google Drive API Integration
 *
 * Setup Instructions:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or select existing)
 * 3. Enable "Google Drive API" and "Google Picker API"
 * 4. Create OAuth 2.0 credentials (Web application type)
 * 5. Add your domain to authorized JavaScript origins
 * 6. Create an API key
 * 7. Add to .env.local:
 *    NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
 *    NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
 */

export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size?: number
  url?: string
  iconUrl?: string
  thumbnailUrl?: string
}

// Load the Google API script
export function loadGoogleApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google API can only be loaded in browser'))
      return
    }

    if ((window as any).gapi) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google API'))
    document.body.appendChild(script)
  })
}

// Load Google Identity Services for OAuth
export function loadGoogleIdentityServices(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Identity Services can only be loaded in browser'))
      return
    }

    if ((window as any).google?.accounts) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.body.appendChild(script)
  })
}

// Initialize the Google Picker API
export async function initGooglePicker(): Promise<void> {
  await loadGoogleApi()

  return new Promise((resolve, reject) => {
    ;(window as any).gapi.load('picker', {
      callback: resolve,
      onerror: () => reject(new Error('Failed to load Google Picker')),
    })
  })
}

// Get OAuth access token
export function getAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.access_token)
        }
      },
    })

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

// Show the Google Picker
export function showGooglePicker(options: {
  accessToken: string
  apiKey: string
  mimeTypes?: string[]
  multiSelect?: boolean
  maxFiles?: number
}): Promise<GoogleDriveFile[]> {
  const { accessToken, apiKey, mimeTypes, multiSelect = true, maxFiles = 10 } = options

  return new Promise((resolve, reject) => {
    const google = (window as any).google

    // Create view for all files or specific mime types
    let view = new google.picker.DocsView()

    if (mimeTypes && mimeTypes.length > 0) {
      view.setMimeTypes(mimeTypes.join(','))
    }

    view.setIncludeFolders(false)
    view.setSelectFolderEnabled(false)

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const files: GoogleDriveFile[] = data.docs.slice(0, maxFiles).map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            size: doc.sizeBytes,
            url: doc.url,
            iconUrl: doc.iconUrl,
            thumbnailUrl: doc.thumbnails?.[0]?.url,
          }))
          resolve(files)
        } else if (data.action === google.picker.Action.CANCEL) {
          resolve([])
        }
      })
      .setTitle('Select files from Google Drive')

    if (multiSelect) {
      picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
    }

    picker.build().setVisible(true)
  })
}

// Download file content from Google Drive
export async function downloadDriveFile(
  fileId: string,
  accessToken: string,
  fileName: string,
  mimeType: string
): Promise<File> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }

  const blob = await response.blob()
  return new File([blob], fileName, { type: mimeType })
}

// Check if Google Drive is configured
export function isGoogleDriveConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  )
}

export function getGoogleConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    isConfigured: isGoogleDriveConfigured(),
  }
}

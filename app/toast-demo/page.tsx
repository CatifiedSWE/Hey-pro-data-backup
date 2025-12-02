"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ToastDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#FA6E80] to-[#31A7AC] bg-clip-text text-transparent">
            Custom Toast Notifications Demo
          </h1>
          <p className="text-gray-600 text-lg">
            HeyProData Brand Colors: <span className="font-semibold text-[#FA6E80]">#FA6E80</span> & <span className="font-semibold text-[#31A7AC]">#31A7AC</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Success Toast */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-[#31A7AC] rounded-full mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Success Toast</h3>
            <p className="text-gray-600 text-sm mb-4">Teal background (#31A7AC)</p>
            <Button
              onClick={() => toast.success("Profile updated successfully!")}
              className="w-full bg-[#31A7AC] hover:bg-[#2a8f94] text-white"
              data-testid="success-toast-btn"
            >
              Show Success
            </Button>
          </div>

          {/* Error Toast */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-[#FA6E80] rounded-full mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Toast</h3>
            <p className="text-gray-600 text-sm mb-4">Pink background (#FA6E80)</p>
            <Button
              onClick={() => toast.error("Failed to upload file")}
              className="w-full bg-[#FA6E80] hover:bg-[#f95570] text-white"
              data-testid="error-toast-btn"
            >
              Show Error
            </Button>
          </div>

          {/* Info Toast */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#31A7AC] to-[#FA6E80] rounded-full mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Info Toast</h3>
            <p className="text-gray-600 text-sm mb-4">Gradient: Teal to Pink</p>
            <Button
              onClick={() => toast.info("No changes were made")}
              className="w-full bg-gradient-to-r from-[#31A7AC] to-[#FA6E80] hover:opacity-90 text-white"
              data-testid="info-toast-btn"
            >
              Show Info
            </Button>
          </div>

          {/* Warning Toast */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#FA6E80] to-[#31A7AC] rounded-full mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Warning Toast</h3>
            <p className="text-gray-600 text-sm mb-4">Gradient: Pink to Teal</p>
            <Button
              onClick={() => toast.warning("Some changes may have failed")}
              className="w-full bg-gradient-to-r from-[#FA6E80] to-[#31A7AC] hover:opacity-90 text-white"
              data-testid="warning-toast-btn"
            >
              Show Warning
            </Button>
          </div>

          {/* Loading Toast */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-[#31A7AC] rounded-full mb-4">
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Toast</h3>
            <p className="text-gray-600 text-sm mb-4">Teal background (#31A7AC)</p>
            <Button
              onClick={() => {
                const loadingToast = toast.loading("Uploading file...");
                setTimeout(() => {
                  toast.dismiss(loadingToast);
                  toast.success("Upload complete!");
                }, 3000);
              }}
              className="w-full bg-[#31A7AC] hover:bg-[#2a8f94] text-white"
              data-testid="loading-toast-btn"
            >
              Show Loading
            </Button>
          </div>

          {/* Default Toast */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#FA6E80] to-[#31A7AC] rounded-full mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Default Toast</h3>
            <p className="text-gray-600 text-sm mb-4">Gradient background</p>
            <Button
              onClick={() => toast("This is a default notification")}
              className="w-full bg-gradient-to-r from-[#FA6E80] to-[#31A7AC] hover:opacity-90 text-white"
              data-testid="default-toast-btn"
            >
              Show Default
            </Button>
          </div>
        </div>

        {/* Action Buttons Demo */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Toast with Actions</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => {
                toast.success("File uploaded successfully!", {
                  action: {
                    label: "View",
                    onClick: () => console.log("View clicked"),
                  },
                });
              }}
              className="bg-[#31A7AC] hover:bg-[#2a8f94] text-white"
              data-testid="action-toast-btn"
            >
              Toast with Action
            </Button>

            <Button
              onClick={() => {
                toast("Are you sure you want to delete this?", {
                  cancel: {
                    label: "Cancel",
                    onClick: () => console.log("Cancel clicked"),
                  },
                  action: {
                    label: "Delete",
                    onClick: () => toast.success("Deleted successfully!"),
                  },
                });
              }}
              className="bg-gradient-to-r from-[#FA6E80] to-[#31A7AC] hover:opacity-90 text-white"
              data-testid="confirm-toast-btn"
            >
              Confirmation Toast
            </Button>

            <Button
              onClick={() => {
                toast.success("Profile updated!", {
                  description: "Your changes have been saved successfully.",
                });
              }}
              className="bg-[#31A7AC] hover:bg-[#2a8f94] text-white"
              data-testid="description-toast-btn"
            >
              Toast with Description
            </Button>
          </div>
        </div>

        {/* Brand Colors Reference */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Brand Colors</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-full h-32 bg-[#FA6E80] rounded-lg mb-3 shadow-md"></div>
              <p className="font-mono text-sm font-semibold">#FA6E80</p>
              <p className="text-gray-600 text-sm">Pink/Coral</p>
            </div>
            <div className="text-center">
              <div className="w-full h-32 bg-[#31A7AC] rounded-lg mb-3 shadow-md"></div>
              <p className="font-mono text-sm font-semibold">#31A7AC</p>
              <p className="text-gray-600 text-sm">Teal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

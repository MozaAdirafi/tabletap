"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/context/AuthContext";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  taxRate: number;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    openingHours: {
      monday: "9:00 AM - 10:00 PM",
      tuesday: "9:00 AM - 10:00 PM",
      wednesday: "9:00 AM - 10:00 PM",
      thursday: "9:00 AM - 10:00 PM",
      friday: "9:00 AM - 11:00 PM",
      saturday: "9:00 AM - 11:00 PM",
      sunday: "9:00 AM - 10:00 PM",
    },
    taxRate: 10,
  });
  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        const restaurantDoc = await getDoc(doc(db, "restaurants", user.uid));

        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data();

          // Check if this is a minimal profile (likely just created through Google sign-in)
          const isMinimalProfile = !data.name && !data.address && !data.phone;

          if (isMinimalProfile) {
            // This is likely a first-time Google login
            setShowWelcomeMessage(true);
          }

          setSettings({
            name: data.name || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || user.email || "",
            description: data.description || "",
            openingHours: data.openingHours || {
              monday: "9:00 AM - 10:00 PM",
              tuesday: "9:00 AM - 10:00 PM",
              wednesday: "9:00 AM - 10:00 PM",
              thursday: "9:00 AM - 10:00 PM",
              friday: "9:00 AM - 11:00 PM",
              saturday: "9:00 AM - 11:00 PM",
              sunday: "9:00 AM - 10:00 PM",
            },
            taxRate: data.taxRate || 10,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching restaurant settings:", error);
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("openingHours.")) {
      const day = name.split(".")[1];
      setSettings((prev) => ({
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [day]: value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: name === "taxRate" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      await updateDoc(doc(db, "restaurants", user.uid), {
        name: settings.name,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        description: settings.description,
        openingHours: settings.openingHours,
        taxRate: settings.taxRate,
        updatedAt: new Date(),
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving restaurant settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <Card>
          <CardHeader className="border-b">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Restaurant Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your restaurant information and settings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
      {showSuccess && (
        <div
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">Settings saved successfully!</span>
        </div>
      )}

      {showWelcomeMessage && (
        <div
          className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <div className="flex">
            <div className="py-1">
              <svg
                className="h-6 w-6 mr-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold">Welcome to TableTap!</p>
              <p className="text-sm">
                Please complete your restaurant profile information below. This
                helps us personalize your experience and properly set up your
                restaurant.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader className="border-b">
          <h2 className="text-lg font-semibold">Basic Information</h2>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Restaurant Name
            </label>
            <Input
              id="name"
              name="name"
              value={settings.name}
              onChange={handleInputChange}
              placeholder="Enter restaurant name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              value={settings.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address
            </label>
            <Input
              id="address"
              name="address"
              value={settings.address}
              onChange={handleInputChange}
              placeholder="Enter restaurant address"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={settings.description}
              onChange={handleInputChange}
              placeholder="Enter restaurant description"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader className="border-b">
          <h2 className="text-lg font-semibold">Operating Hours</h2>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {Object.entries(settings.openingHours).map(([day, hours]) => (
            <div key={day}>
              <label
                htmlFor={`openingHours.${day}`}
                className="block text-sm font-medium text-gray-700 mb-1 capitalize"
              >
                {day}
              </label>
              <Input
                id={`openingHours.${day}`}
                name={`openingHours.${day}`}
                value={hours}
                onChange={handleInputChange}
                placeholder="e.g. 9:00 AM - 10:00 PM"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader className="border-b">
          <h2 className="text-lg font-semibold">Tax Settings</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div>
            <label
              htmlFor="taxRate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tax Rate (%)
            </label>
            <Input
              id="taxRate"
              name="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.taxRate.toString()}
              onChange={handleInputChange}
              placeholder="Enter tax rate percentage"
            />
            <p className="mt-2 text-sm text-gray-500">
              This tax rate will be applied to all orders. For example, if you
              set it to 10%, a $100 order will have $10 tax added.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

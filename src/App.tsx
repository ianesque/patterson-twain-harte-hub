import { useState } from "react";
import { HashRouter, Route, Routes } from "react-router";
import { PasswordGate } from "@/components/trip/password-gate";
import { isAuthenticated } from "@/lib/auth";
import { TripHubPage } from "@/pages/trip-hub";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function App() {
    const [authed, setAuthed] = useState(isAuthenticated);

    if (!authed) {
        return (
            <ThemeProvider>
                <PasswordGate onSuccess={() => setAuthed(true)} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <HashRouter>
                <RouteProvider>
                    <Routes>
                        <Route path="/" element={<TripHubPage />} />
                        <Route path="*" element={<TripHubPage />} />
                    </Routes>
                </RouteProvider>
            </HashRouter>
        </ThemeProvider>
    );
}

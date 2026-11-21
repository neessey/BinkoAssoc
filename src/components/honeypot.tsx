// Champ piège invisible : les humains ne le voient pas, les robots le remplissent.
export function Honeypot() {
    return (
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
            <label>
                Ne pas remplir
                <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
        </div>
    )
}

export function readHoneypot(e: React.FormEvent): string {
    const form = e.currentTarget as HTMLFormElement
    const el = form.elements.namedItem("website")
    return el instanceof HTMLInputElement ? el.value : ""
}

"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { apiJson, formatApiError } from "@/lib/api-client";

import s from "./punch-list.module.css";

type Props = {
  /** Form inside modal: no card chrome, footer actions. */
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CreateProjectForm({
  embedded = false,
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter();
  const uid = useId();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await apiJson<{ project: { id: string } }>("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name, address }),
      });
      setName("");
      setAddress("");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setPending(false);
    }
  }

  const nameId = `proj-name-${uid}`;
  const addrId = `proj-address-${uid}`;

  return (
    <form
      className={embedded ? s.formInModal : s.card}
      onSubmit={onSubmit}
    >
      {!embedded ? <h2>New project</h2> : null}
      <div className={s.field}>
        <label htmlFor={nameId}>Project name</label>
        <input
          id={nameId}
          className={s.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={500}
          autoComplete="off"
          placeholder="e.g. Riverside Tower — Phase 2"
        />
      </div>
      <div className={s.field}>
        <label htmlFor={addrId}>Jobsite address</label>
        <textarea
          id={addrId}
          className={s.textarea}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          maxLength={2000}
          rows={3}
          placeholder="Street address or site location for this job"
          aria-describedby={`${addrId}-hint`}
        />
        <p id={`${addrId}-hint`} className={s.hint}>
          The physical job location (building or site), not your personal mailing address.
        </p>
      </div>
      {error ? <p className={s.error}>{error}</p> : null}
      {embedded ? (
        <div className={s.formActions}>
          {onCancel ? (
            <button
              type="button"
              className={s.btnGhost}
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </button>
          ) : null}
          <button type="submit" className={s.btnPrimary} disabled={pending}>
            {pending ? "Creating…" : "Create project"}
          </button>
        </div>
      ) : (
        <button type="submit" className={s.btnPrimary} disabled={pending}>
          {pending ? "Creating…" : "Create project"}
        </button>
      )}
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { PUNCH_ITEM_PRIORITIES } from "@/lib/domain/priority";
import { apiJson, formatApiError } from "@/lib/api-client";

import s from "./punch-list.module.css";

type Props = {
  projectId: string;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CreatePunchItemForm({
  projectId,
  embedded = false,
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter();
  const uid = useId();
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("normal");
  const [assignedTo, setAssignedTo] = useState("");
  const [photo, setPhoto] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const body: Record<string, unknown> = {
        location,
        description,
        priority,
      };
      if (assignedTo.trim()) body.assignedTo = assignedTo.trim();
      if (photo.trim()) body.photo = photo.trim();

      await apiJson(`/api/projects/${projectId}/punch-items`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setLocation("");
      setDescription("");
      setPriority("normal");
      setAssignedTo("");
      setPhoto("");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setPending(false);
    }
  }

  const locId = `pi-loc-${uid}`;
  const descId = `pi-desc-${uid}`;
  const priId = `pi-priority-${uid}`;
  const assignId = `pi-assign-${uid}`;
  const photoId = `pi-photo-${uid}`;

  return (
    <form
      className={embedded ? s.formInModal : s.card}
      onSubmit={onSubmit}
    >
      {!embedded ? <h2>Add punch item</h2> : null}
      <div className={s.field}>
        <label htmlFor={locId}>Location</label>
        <input
          id={locId}
          className={s.input}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          maxLength={2000}
          placeholder="e.g. Unit 204 — Kitchen"
        />
      </div>
      <div className={s.field}>
        <label htmlFor={descId}>Description</label>
        <textarea
          id={descId}
          className={s.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={8000}
          rows={3}
        />
      </div>
      <div className={s.field}>
        <label htmlFor={priId}>Priority</label>
        <select
          id={priId}
          className={s.select}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {PUNCH_ITEM_PRIORITIES.map((pr) => (
            <option key={pr} value={pr}>
              {pr.charAt(0).toUpperCase() + pr.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className={s.field}>
        <label htmlFor={assignId}>Assigned to (optional)</label>
        <input
          id={assignId}
          className={s.input}
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          maxLength={200}
          autoComplete="off"
          placeholder="Worker or trade name"
        />
      </div>
      <div className={s.field}>
        <label htmlFor={photoId}>Photo URL (optional)</label>
        <input
          id={photoId}
          className={s.input}
          type="url"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          maxLength={2048}
          placeholder="https://…"
        />
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
            {pending ? "Adding…" : "Add punch item"}
          </button>
        </div>
      ) : (
        <button type="submit" className={s.btnPrimary} disabled={pending}>
          {pending ? "Adding…" : "Add item"}
        </button>
      )}
    </form>
  );
}

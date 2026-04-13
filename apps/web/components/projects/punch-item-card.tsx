"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  PUNCH_ITEM_STATUSES,
  isPunchItemStatus,
  isSelectableStatusTarget,
  type PunchItemStatus,
} from "@/lib/domain/punch-item-status";
import { PUNCH_ITEM_PRIORITIES } from "@/lib/domain/priority";
import { apiJson, formatApiError } from "@/lib/api-client";
import type { PunchItemSerialized } from "@/lib/serializers";

import { PriorityIndicator } from "./priority-indicator";
import s from "./punch-list.module.css";

const STATUS_LABELS: Record<PunchItemStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  complete: "Complete",
};

type Props = {
  item: PunchItemSerialized;
  className?: string;
  /** Called after a successful PATCH so the parent can reorder (e.g. Kanban) before RSC refresh. */
  onItemUpdated?: (item: PunchItemSerialized) => void;
};

export function PunchItemCard({ item: initial, className, onItemUpdated }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [item, setItem] = useState(initial);
  const [location, setLocation] = useState(initial.location);
  const [description, setDescription] = useState(initial.description);
  const [priority, setPriority] = useState(initial.priority);
  const [assignedTo, setAssignedTo] = useState(initial.assignedTo ?? "");
  const [photo, setPhoto] = useState(initial.photo ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItem(initial);
    if (!editing) {
      setLocation(initial.location);
      setDescription(initial.description);
      setPriority(initial.priority);
      setAssignedTo(initial.assignedTo ?? "");
      setPhoto(initial.photo ?? "");
    }
  }, [initial, editing]);

  async function patchBody(body: Record<string, unknown>) {
    setError(null);
    setPending(true);
    try {
      const res = await apiJson<{ item: PunchItemSerialized }>(
        `/api/punch-items/${item.id}`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
      setItem(res.item);
      setLocation(res.item.location);
      setDescription(res.item.description);
      setPriority(res.item.priority);
      setAssignedTo(res.item.assignedTo ?? "");
      setPhoto(res.item.photo ?? "");
      setEditing(false);
      onItemUpdated?.(res.item);
      router.refresh();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setPending(false);
    }
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      location,
      description,
      priority,
      assignedTo: assignedTo.trim() === "" ? null : assignedTo.trim(),
    };
    if (photo.trim() === "") body.photo = null;
    else body.photo = photo.trim();
    await patchBody(body);
  }

  async function onStatusSelectChange(next: string) {
    if (!isPunchItemStatus(next) || next === item.status) return;
    await patchBody({ status: next });
  }

  const statusLocked = item.status === "complete";
  const rootClass = [s.itemCard, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className={s.itemHead}>
        <div className={s.statusRow}>
          <PriorityIndicator priority={item.priority} />
          <span className={s.itemMeta}>
            {item.assignedTo ? item.assignedTo : "Unassigned"}
          </span>
          <select
            className={s.statusSelect}
            value={item.status}
            disabled={pending || editing || statusLocked}
            aria-label="Status"
            title={statusLocked ? "Completed items cannot change status" : undefined}
            onChange={(e) => {
              void onStatusSelectChange(e.target.value);
            }}
          >
            {PUNCH_ITEM_STATUSES.map((st) => (
              <option
                key={st}
                value={st}
                disabled={!isSelectableStatusTarget(item.status, st)}
              >
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={s.btnGhost}
          onClick={() => {
            setError(null);
            setEditing((v) => !v);
            if (editing) {
              setLocation(item.location);
              setDescription(item.description);
              setPriority(item.priority);
              setAssignedTo(item.assignedTo ?? "");
              setPhoto(item.photo ?? "");
            }
          }}
          disabled={pending}
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
      {editing ? (
        <form onSubmit={onSaveEdit} style={{ marginTop: "0.75rem" }}>
          <div className={s.field}>
            <label>Location</label>
            <input
              className={s.input}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              maxLength={2000}
            />
          </div>
          <div className={s.field}>
            <label>Description</label>
            <textarea
              className={s.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={8000}
            />
          </div>
          <div className={s.field}>
            <label>Priority</label>
            <select
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
            <div className={s.priorityLegend} aria-hidden>
              <span className={s.priorityLegendItem}>
                <span className={`${s.priorityDot} ${s.priorityDotLow}`} />
                Low
              </span>
              <span className={s.priorityLegendItem}>
                <span className={`${s.priorityDot} ${s.priorityDotNormal}`} />
                Normal
              </span>
              <span className={s.priorityLegendItem}>
                <span className={`${s.priorityDot} ${s.priorityDotHigh}`} />
                High
              </span>
            </div>
          </div>
          <div className={s.field}>
            <label>Assigned to</label>
            <input
              className={s.input}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className={s.field}>
            <label>Photo URL</label>
            <input
              className={s.input}
              type="url"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              maxLength={2048}
              placeholder="https://… or leave empty"
            />
          </div>
          {error ? <p className={s.error}>{error}</p> : null}
          <button type="submit" className={s.btnPrimary} disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      ) : (
        <>
          <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>{item.location}</p>
          <p className={s.muted} style={{ marginTop: "0.35rem" }}>
            {item.description}
          </p>
          {item.photo ? (
            <p className={s.muted} style={{ marginTop: "0.5rem" }}>
              <a href={item.photo} target="_blank" rel="noreferrer">
                Photo link
              </a>
            </p>
          ) : null}
          {error ? <p className={s.error}>{error}</p> : null}
        </>
      )}
    </div>
  );
}

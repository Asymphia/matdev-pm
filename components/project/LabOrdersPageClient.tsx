"use client"

import { useCallback, useState, useTransition } from "react"
import { PlusIcon } from "@heroicons/react/24/outline"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import Th from "@/components/ui/Th"
import DeleteIconButton from "@/components/ui/DeleteIconButton"
import Button from "@/components/ui/Button"
import { statusBadgeClasses } from "@/components/ui/StatusItem"
import LabOrderFormModal from "@/components/project/LabOrderFormModal"
import type { LabOrder, LabOrderStatus } from "@/lib/server/matdev-lab-orders"
import {
    createLabOrder,
    deleteLabOrder,
    deleteLabOrderFinalReport,
    deleteLabOrderTestReport,
    fetchLabOrders,
    updateLabOrder,
    uploadLabOrderFinalReport,
    uploadLabOrderTestReport,
    type CreateLabOrderInput,
    type LabOrderFileActions,
    type UpdateLabOrderInput,
} from "@/app/actions/lab-order-mutations"
import { getLabOrderReportDownloadUrl, isExternalReportLink, type LabReportKind } from "@/lib/lab-order-files"
import { useConfirm } from "@/hooks/useConfirm"
import AlertBanner from "@/components/ui/AlertBanner"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { toUserFacingError } from "@/lib/user-facing-errors"

type Props = {
    projectId: number
    initialOrders: LabOrder[]
    statuses: LabOrderStatus[]
    initialApiError?: string | null
}

const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—"
    const d = iso.slice(0, 10)
    const [y, m, day] = d.split("-")
    return `${day}.${m}.${y}`
}

const ReportLink = ({
    projectId,
    labOrderId,
    name,
    link,
    hasStored,
    kind,
}: {
    projectId: number
    labOrderId: number
    name: string | null
    link: string | null
    hasStored: boolean
    kind: LabReportKind
}) => {
    if (!name && !link && !hasStored) return <span className="text-text-primary-300">—</span>

    if (hasStored) {
        const url = getLabOrderReportDownloadUrl(projectId, labOrderId, kind)
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-700 hover:underline"
                download={name ?? undefined}
            >
                {name || "Pobierz raport"}
            </a>
        )
    }

    if (isExternalReportLink(link)) {
        return (
            <a href={link!} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">
                {name || "Open report"}
            </a>
        )
    }

    return <span title={link ?? undefined}>{name || link || "—"}</span>
}

const LabOrdersPageClient = ({ projectId, initialOrders, statuses, initialApiError = null }: Props) => {
    const [orders, setOrders] = useState<LabOrder[]>(initialOrders)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<LabOrder | null>(null)
    const [error, setError] = useState<string | null>(initialApiError)
    const [pending, startTransition] = useTransition()
    const { confirm, ConfirmModal } = useConfirm()

    const refresh = useCallback(async () => {
        const res = await fetchLabOrders(projectId)
        if (res.ok) setOrders(res.data)
    }, [projectId])

    const applyFileActions = async (labOrderId: number, files?: LabOrderFileActions): Promise<string | null> => {
        if (!files) return null

        if (files.removeTestReport) {
            const res = await deleteLabOrderTestReport(projectId, labOrderId)
            if (!res.ok) return res.error
        }
        if (files.removeFinalReport) {
            const res = await deleteLabOrderFinalReport(projectId, labOrderId)
            if (!res.ok) return res.error
        }
        if (files.testReportFile) {
            const res = await uploadLabOrderTestReport(projectId, labOrderId, files.testReportFile)
            if (!res.ok) return res.error
        }
        if (files.finalReportFile) {
            const res = await uploadLabOrderFinalReport(projectId, labOrderId, files.finalReportFile)
            if (!res.ok) return res.error
        }
        return null
    }

    const openCreate = () => {
        setEditing(null)
        setModalOpen(true)
    }

    const openEdit = (order: LabOrder) => {
        setEditing(order)
        setModalOpen(true)
    }

    const handleSubmit = async (
        input: CreateLabOrderInput | UpdateLabOrderInput,
        files?: LabOrderFileActions
    ): Promise<boolean> => {
        return new Promise(resolve => {
            startTransition(async () => {
                setError(null)
                let labOrderId: number | undefined

                if (editing) {
                    const res = await updateLabOrder(projectId, editing.labOrderId, input as UpdateLabOrderInput)
                    if (!res.ok) {
                        setError(res.error)
                        resolve(false)
                        return
                    }
                    labOrderId = editing.labOrderId
                } else {
                    const res = await createLabOrder(projectId, input as CreateLabOrderInput)
                    if (!res.ok) {
                        setError(res.error)
                        resolve(false)
                        return
                    }
                    labOrderId = res.data.labOrderId
                }

                if (labOrderId != null) {
                    if (!editing) {
                        const linkUpdate: UpdateLabOrderInput = {}
                        if (files?.externalTestReportLink) {
                            linkUpdate.testReportLink = files.externalTestReportLink
                            linkUpdate.testReportFileName =
                                files.externalTestReportLink.split("/").pop()?.trim() || undefined
                        }
                        if (files?.externalFinalReportLink) {
                            linkUpdate.finalReportLink = files.externalFinalReportLink
                            linkUpdate.finalReportFileName =
                                files.externalFinalReportLink.split("/").pop()?.trim() || undefined
                        }
                        if (Object.keys(linkUpdate).length > 0) {
                            const linkRes = await updateLabOrder(projectId, labOrderId, linkUpdate)
                            if (!linkRes.ok) {
                                setError(linkRes.error)
                                resolve(false)
                                return
                            }
                        }
                    }

                    const fileError = await applyFileActions(labOrderId, files)
                    if (fileError) {
                        setError(fileError)
                        resolve(false)
                        return
                    }
                }

                await refresh()
                resolve(true)
            })
        })
    }

    const handleDelete = async (order: LabOrder) => {
        const ok = await confirm({
            title: "Delete lab order",
            message: `Remove order "${order.description}"?`,
            confirmLabel: "Delete",
            danger: true,
        })
        if (!ok) return
        startTransition(async () => {
            setError(null)
            const res = await deleteLabOrder(projectId, order.labOrderId)
            if (!res.ok) {
                setError(res.error)
                return
            }
            await refresh()
        })
    }

    return (
        <>
            <BlockWrapper className="relative gap-4 p-6 sm:p-9">
                {pending ? (
                    <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                        <LoadingSpinner size="md" label="Zapisuję zlecenie…" />
                    </div>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <CardTitle>Laboratory orders</CardTitle>
                        <p className="text-text-primary-300 mt-1 text-sm">
                            Track sample tests, upload lab reports (PDF, Office, images) and download them later.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="inline-flex items-center gap-2" disabled={statuses.length === 0 && Boolean(error)}>
                        <PlusIcon className="size-4" />
                        New order
                    </Button>
                </div>

                {error ? (
                    <AlertBanner
                        variant="error"
                        title="Problem z modułem Lab"
                        message={toUserFacingError(error, "api")}
                        onRetry={() => refresh()}
                        retryLabel="Odśwież listę"
                        retryPending={pending}
                        onDismiss={() => setError(null)}
                    />
                ) : null}

                {orders.length === 0 ? (
                    <p className="text-text-primary-300 py-8 text-center text-sm">
                        No lab orders yet. Create one to track sample testing.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[56rem] border-collapse text-sm">
                            <thead>
                                <tr className="border-border border-b border-solid">
                                    <Th>Sample</Th>
                                    <Th>Description</Th>
                                    <Th>Status</Th>
                                    <Th>Planned</Th>
                                    <Th>Predicted</Th>
                                    <Th>Completed</Th>
                                    <Th>Test report</Th>
                                    <Th>Final report</Th>
                                    <Th align="right"> </Th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr
                                        key={order.labOrderId}
                                        className="border-border hover:bg-foreground/40 border-b border-solid last:border-b-0"
                                    >
                                        <td className="text-text-primary py-3 pr-4 font-mono text-xs">
                                            {order.sampleId || "—"}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(order)}
                                                className="text-left hover:text-primary-700 hover:underline"
                                            >
                                                {order.description}
                                            </button>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${statusBadgeClasses(order.statusName ?? "Created")}`}
                                            >
                                                {order.statusName ?? "—"}
                                            </span>
                                        </td>
                                        <td className="text-text-primary-300 py-3 pr-4 whitespace-nowrap">
                                            {formatDate(order.plannedCompletionDate)}
                                        </td>
                                        <td className="text-text-primary-300 py-3 pr-4 whitespace-nowrap">
                                            {formatDate(order.predictedCompletionDate)}
                                        </td>
                                        <td className="text-text-primary-300 py-3 pr-4 whitespace-nowrap">
                                            {formatDate(order.completionDate)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <ReportLink
                                                projectId={projectId}
                                                labOrderId={order.labOrderId}
                                                name={order.testReportFileName}
                                                link={order.testReportLink}
                                                hasStored={order.hasStoredTestReport}
                                                kind="test"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <ReportLink
                                                projectId={projectId}
                                                labOrderId={order.labOrderId}
                                                name={order.finalReportFileName}
                                                link={order.finalReportLink}
                                                hasStored={order.hasStoredFinalReport}
                                                kind="final"
                                            />
                                        </td>
                                        <td className="py-3 text-right">
                                            <DeleteIconButton
                                                title="Delete lab order"
                                                onClick={() => handleDelete(order)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </BlockWrapper>

            <LabOrderFormModal
                key={editing?.labOrderId ?? "create"}
                projectId={projectId}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                statuses={statuses}
                initial={editing}
                pending={pending}
            />
            <ConfirmModal />
        </>
    )
}

export default LabOrdersPageClient

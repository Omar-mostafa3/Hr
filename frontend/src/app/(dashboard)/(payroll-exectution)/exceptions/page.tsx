"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/calc-draft-ui/card"
import { Input } from "@/components/calc-draft-ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/calc-draft-ui/select"
import { Search, Filter, AlertTriangle, ArrowLeft, Eye, X, Clock, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/calc-draft-ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

type ExceptionType =
  | "all"
  | "MISSING_BANK_DETAILS"
  | "NEGATIVE_NET_PAY"
  | "EXCESSIVE_PENALTIES"
  | "ZERO_BASE_SALARY"
  | "CALCULATION_ERROR"

type ExceptionStatus = "all" | "open" | "in-progress" | "resolved"

export default function ExceptionsReviewPage() {
  const { toast } = useToast()
  const { user, token } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const draftIdFromUrl = searchParams.get("draftId")
  const runIdFromUrl = searchParams.get("runId")

  const [exceptions, setExceptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ExceptionType>("all")
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus>("all")
  const [runFilter, setRunFilter] = useState(runIdFromUrl || "all")
  const [runs, setRuns] = useState<any[]>([])

  const [selectedException, setSelectedException] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Helper functions to infer exception details from text
  const inferExceptionType = (exceptionText: string): string => {
    const text = exceptionText?.toLowerCase() || ''
    if (text.includes('bank')) return 'MISSING_BANK_DETAILS'
    if (text.includes('negative')) return 'NEGATIVE_NET_PAY'
    if (text.includes('penalties') || text.includes('penalty')) return 'EXCESSIVE_PENALTIES'
    if (text.includes('zero') && text.includes('salary')) return 'ZERO_BASE_SALARY'
    return 'CALCULATION_ERROR'
  }

  const inferExceptionStatus = (exceptionText: string): ExceptionStatus => {
    const text = exceptionText?.toLowerCase() || ''
    if (text.includes('resolved')) return 'resolved'
    if (text.includes('in progress') || text.includes('investigating')) return 'in-progress'
    return 'open'
  }

  const extractResolutionNote = (exceptionText: string): string | undefined => {
    if (!exceptionText) return undefined
    const match = exceptionText.match(/RESOLVED:\s*(.+)$/i)
    return match ? match[1].trim() : undefined
  }

  const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      MISSING_BANK_DETAILS: "Missing Bank Details",
      NEGATIVE_NET_PAY: "Negative Net Pay",
      EXCESSIVE_PENALTIES: "Excessive Penalties",
      ZERO_BASE_SALARY: "Zero Base Salary",
      CALCULATION_ERROR: "Calculation Error",
    }
    return typeMap[type] || type
  }

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      open: { class: "bg-orange-100 text-orange-800 border-orange-300", label: "Open" },
      "in-progress": { class: "bg-blue-100 text-blue-800 border-blue-300", label: "In Progress" },
      resolved: { class: "bg-green-100 text-green-800 border-green-300", label: "Resolved" },
    }
    return statusMap[status] || { class: "bg-gray-100 text-gray-800 border-gray-300", label: status }
  }

  // Helper to create auth headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all payroll runs
        const runsResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs`, {
          headers: getAuthHeaders(),
        })
        let runsData: any[] = []
        if (runsResponse.ok) {
          runsData = await runsResponse.json()
          if (!Array.isArray(runsData)) {
            runsData = []
          }
        }
        setRuns(runsData)

        // Fetch exceptions for all runs
        const allExceptions: any[] = []
        if (runsData.length > 0) {
          for (const run of runsData) {
            try {
              const exceptionsResponse = await fetch(
                `${API_URL}/payroll-execution/payroll-runs/${run._id}/exceptions`,
                { headers: getAuthHeaders() }
              )
              if (exceptionsResponse.ok) {
                const data = await exceptionsResponse.json()

                if (data.exceptions && Array.isArray(data.exceptions)) {
                  const formattedExceptions = data.exceptions
                    .filter((exc: any) => {
                      return exc.exception && typeof exc.exception === 'string' && exc.exception.trim() !== ''
                    })
                    .map((exc: any) => {
                      const employee = exc.employee || {}
                      
                      let employeeName = 'Unknown'
                      if (employee && typeof employee === 'object') {
                        if (employee.firstName || employee.lastName) {
                          employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
                        } else if (employee.name) {
                          employeeName = employee.name
                        } else if (employee.email) {
                          employeeName = employee.email.split('@')[0]
                        }
                      } else if (typeof employee === 'string') {
                        employeeName = `Employee ${employee.substring(0, 8)}...`
                      }

                      const employeeId = typeof employee === 'object' 
                        ? (employee._id || employee.id || '') 
                        : (employee || '')

                      return {
                        _id: exc._id || employeeId || `${run._id}-${Math.random()}`,
                        employeeId: employeeId,
                        employeeName: employeeName || 'Unknown',
                        payrollRunId: run._id,
                        runId: run.runId || run._id,
                        type: inferExceptionType(exc.exception),
                        exception: exc.exception || '',
                        description: exc.exception || '',
                        status: inferExceptionStatus(exc.exception),
                        resolutionNote: extractResolutionNote(exc.exception),
                        createdAt: exc.createdAt,
                      }
                    })

                  allExceptions.push(...formattedExceptions)
                }
              }
            } catch (err) {
              console.error("Error fetching exceptions for run:", run._id, err)
            }
          }
        }
        setExceptions(allExceptions)
        setLoading(false)
      } catch (err: any) {
        console.log("API not available:", err.message)
        setError(err.message || "Failed to load data")
        setLoading(false)
      }
    }

    fetchData()
  }, [toast, token])

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((exc) => {
      const matchesSearch =
        (exc.employeeName && exc.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (exc.runId && exc.runId.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = typeFilter === "all" || exc.type === typeFilter
      const matchesStatus = statusFilter === "all" || exc.status === statusFilter
      const matchesRun = runFilter === "all" || exc.payrollRunId === runFilter

      return matchesSearch && matchesType && matchesStatus && matchesRun
    })
  }, [exceptions, searchQuery, typeFilter, statusFilter, runFilter])

  const handleViewDetail = (exception: any) => {
    setSelectedException(exception)
    setShowDetailModal(true)
  }

  const stats = {
    total: exceptions.length,
    open: exceptions.filter((e) => e.status === "open").length,
    inProgress: exceptions.filter((e) => e.status === "in-progress").length,
    resolved: exceptions.filter((e) => e.status === "resolved").length,
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8">
        {draftIdFromUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2"
            onClick={() => router.push(`/payroll/runs/${draftIdFromUrl}/draft`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Draft Review
          </Button>
        )}
        <h1 className="text-3xl font-bold">Payroll Exceptions Review</h1>
        <p className="text-muted-foreground mt-1">View and analyze payroll calculation exceptions</p>
        {user && (
          <p className="text-sm text-muted-foreground mt-2">
            Logged in as: {user.firstName} {user.lastName} ({user.roles.join(", ")})
          </p>
        )}
      </div>

      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exceptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Employee name or run ID"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ExceptionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MISSING_BANK_DETAILS">Missing Bank Details</SelectItem>
                  <SelectItem value="NEGATIVE_NET_PAY">Negative Net Pay</SelectItem>
                  <SelectItem value="EXCESSIVE_PENALTIES">Excessive Penalties</SelectItem>
                  <SelectItem value="ZERO_BASE_SALARY">Zero Base Salary</SelectItem>
                  <SelectItem value="CALCULATION_ERROR">Calculation Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ExceptionStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Run</label>
              <Select value={runFilter} onValueChange={setRunFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="bg-white">All Runs</SelectItem>
                  {runs.map((run) => (
                    <SelectItem key={run._id} value={run._id} className="bg-white">
                      {run.runId || run._id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exceptions List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading exceptions...</p>
            </div>
          ) : filteredExceptions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No exceptions found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Run ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredExceptions.map((exception) => {
                    const statusConfig = getStatusConfig(exception.status)
                    return (
                      <tr key={exception._id} className="hover:bg-muted/50 transition">
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.class}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">{getTypeLabel(exception.type)}</td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium">{exception.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{exception.employeeId}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{exception.runId}</td>
                        <td className="px-4 py-4">
                          <p className="text-sm max-w-md truncate">{exception.description}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {exception.createdAt ? new Date(exception.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(exception)}
                            className="gap-1"
                          >
                            <Eye size={16} />
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedException && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white">
            <CardHeader className="sticky top-0 bg-white border-b flex flex-row items-center justify-between">
              <CardTitle>Exception Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedException(null)
                }}
              >
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border-2 ${getStatusConfig(selectedException.status).class}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">
                    {getStatusConfig(selectedException.status).label}
                  </span>
                  <span className="text-sm font-medium">
                    {getTypeLabel(selectedException.type)}
                  </span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Employee Name</p>
                  <p className="font-semibold">{selectedException.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Employee ID</p>
                  <p className="font-semibold">{selectedException.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Run ID</p>
                  <p className="font-semibold">{selectedException.runId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Detected At</p>
                  <p className="font-semibold">
                    {selectedException.createdAt 
                      ? new Date(selectedException.createdAt).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-lg mb-2">Description</h4>
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <p className="text-sm">{selectedException.description || 'No description available'}</p>
                </div>
              </div>

              {/* Exception Details */}
              <div>
                <h4 className="font-semibold text-lg mb-2">Exception Details</h4>
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{selectedException.exception}</p>
                </div>
              </div>

              {/* Resolution Note (if resolved) */}
              {selectedException.resolutionNote && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Resolution Note</h4>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-sm text-green-800">{selectedException.resolutionNote}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
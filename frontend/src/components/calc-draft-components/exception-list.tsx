"use client"

import { Card, CardContent } from "@/components/calc-draft-ui/card"
import { Button } from "@/components/calc-draft-ui/button"
import { Badge } from "@/components/calc-draft-ui/badge"
import { AlertTriangle, Loader, Lock } from "lucide-react"

interface ExceptionListProps {
  exceptions: any[]
  loading: boolean
  onResolve: (exception: any) => void
  canResolve?: boolean // New prop to control resolve button visibility/state
}

export default function ExceptionList({ 
  exceptions, 
  loading, 
  onResolve, 
  canResolve = true 
}: ExceptionListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (exceptions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No exceptions found</p>
            <p className="text-muted-foreground">All payroll calculations are clean</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MISSING_BANK_DETAILS":
        return "text-yellow-600 dark:text-yellow-400"
      case "NEGATIVE_NET_PAY":
        return "text-red-600 dark:text-red-400"
      case "EXCESSIVE_PENALTIES":
        return "text-orange-600 dark:text-orange-400"
      case "ZERO_BASE_SALARY":
        return "text-purple-600 dark:text-purple-400"
      default:
        return "text-blue-600 dark:text-blue-400"
    }
  }

  const formatTypeName = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {exceptions.map((exception) => (
        <Card key={exception._id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{exception.employeeName}</h3>
                  <Badge className={getStatusColor(exception.status)}>
                    {exception.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className={`font-medium ${getTypeColor(exception.type)}`}>
                      {formatTypeName(exception.type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Run</p>
                    <p className="font-medium">{exception.runId}</p>
                  </div>
                  {exception.createdAt && (
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(exception.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                {exception.description && (
                  <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-2 rounded">
                    {exception.description}
                  </p>
                )}
                {exception.resolutionNote && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <span className="font-medium">Resolution:</span> {exception.resolutionNote}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {canResolve ? (
                  <Button
                    onClick={() => onResolve(exception)}
                    disabled={exception.status === "resolved"}
                    variant={exception.status === "resolved" ? "outline" : "default"}
                  >
                    {exception.status === "resolved" ? "Resolved" : "Resolve"}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="gap-2">
                    <Lock className="w-4 h-4" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
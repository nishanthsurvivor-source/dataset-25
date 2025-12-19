/**
 * Role Hierarchy Component
 * Shows supervision structure and role relationships
 */
export default function RoleHierarchy({ participants, roleStructure }) {
  if (!roleStructure || roleStructure.length === 0) {
    // Fallback: create basic hierarchy from participants
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h4 className="text-lg font-heading font-bold text-gray-900 mb-2">
            Role Supervision Hierarchy
          </h4>
          <p className="text-sm text-gray-600">
            Organizational structure and supervision relationships
          </p>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">
          No role hierarchy data available
        </div>
      </div>
    );
  }

  // Build hierarchy tree
  const buildHierarchy = (roles) => {
    const roleMap = new Map();
    const rootRoles = [];

    // Create map of all roles
    roles.forEach((role) => {
      roleMap.set(role.id, { ...role, children: [] });
    });

    // Build tree structure
    roles.forEach((role) => {
      if (role.supervisorId) {
        const supervisor = roleMap.get(role.supervisorId);
        if (supervisor) {
          supervisor.children.push(roleMap.get(role.id));
        }
      } else {
        rootRoles.push(roleMap.get(role.id));
      }
    });

    return rootRoles;
  };

  const hierarchy = buildHierarchy(roleStructure);

  const renderRoleNode = (role, level = 0) => {
    const hasChildren = role.children && role.children.length > 0;
    const indent = level * 40;

    return (
      <div key={role.id} className="relative">
        {/* Role Card */}
        <div
          className={`relative mb-4 ${
            level === 0 ? 'ml-0' : 'ml-8'
          }`}
          style={{ marginLeft: `${indent}px` }}
        >
          {/* Connection Line */}
          {level > 0 && (
            <div
              className="absolute left-0 top-0 w-px bg-sage-300"
              style={{
                left: `${indent - 20}px`,
                height: hasChildren ? '100%' : '50%',
                maxHeight: '1000px',
              }}
            />
          )}

          <div
            className={`p-4 rounded-lg border-2 shadow-sm transition-all ${
              role.level === 'executive'
                ? 'border-sage-500 bg-sage-50'
                : role.level === 'manager'
                ? 'border-accent-400 bg-accent-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      role.level === 'executive'
                        ? 'bg-sage-600'
                        : role.level === 'manager'
                        ? 'bg-accent-600'
                        : 'bg-gray-500'
                    }`}
                  >
                    {role.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-gray-900">
                      {role.name}
                    </h5>
                    <p className="text-xs text-gray-600">{role.title}</p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      role.level === 'executive'
                        ? 'bg-sage-200 text-sage-800'
                        : role.level === 'manager'
                        ? 'bg-accent-200 text-accent-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {role.level?.toUpperCase() || 'MEMBER'}
                  </span>
                  {role.department && (
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                      {role.department}
                    </span>
                  )}
                </div>

                {/* Supervision Info */}
                {role.supervises && role.supervises.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Supervises:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.supervises.map((subordinate, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-sage-100 text-sage-700 rounded text-xs"
                        >
                          {subordinate}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {role.supervisor && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Reports to:</span>{' '}
                      {role.supervisor}
                    </p>
                  </div>
                )}
              </div>

              {/* Supervision Count */}
              {hasChildren && (
                <div className="ml-4 text-right">
                  <div className="w-8 h-8 rounded-full bg-sage-500 text-white flex items-center justify-center font-bold text-xs">
                    {role.children.length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Reports</p>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Connector */}
          {level > 0 && (
            <div
              className="absolute left-0 top-1/2 w-5 h-px bg-sage-300"
              style={{ left: `${indent - 20}px` }}
            />
          )}
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="relative">
            {role.children.map((child) => renderRoleNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-heading font-bold text-gray-900 mb-2">
          Role Supervision Hierarchy
        </h4>
        <p className="text-sm text-gray-600">
          Organizational structure showing supervision relationships
        </p>
      </div>

      {/* Hierarchy Tree */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {hierarchy.length > 0 ? (
          <div className="space-y-2">
            {hierarchy.map((root) => renderRoleNode(root))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No hierarchy data available
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="text-sm font-semibold text-gray-900 mb-3">Role Levels</h5>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-sage-600 mr-2"></div>
            <span>Executive</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-accent-600 mr-2"></div>
            <span>Manager</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
            <span>Member</span>
          </div>
        </div>
      </div>
    </div>
  );
}


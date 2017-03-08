{
  'targets': [
    {
      'target_name': "<!(node -p \"require('./').name\")",
      'type': 'static_library',
      'defines': [
        'BUILDING_NODE_API'
      ],
      'sources': [
        'abi-stable-node-types.h',
        'abi-stable-node.h',
        'abi-stable-node-v8.cc',
        'abi-stable-node-v8-register.cc',
        'abi-stable-node-async-types.h',
        'abi-stable-node-async.h',
        'abi-stable-node-async.cc',
        'node-api.h',
        'node-api-inl.h',
      ]
    }
  ]
}

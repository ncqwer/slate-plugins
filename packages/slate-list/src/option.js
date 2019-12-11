export default {
  listType: 'list',
  listItemType: 'list-item',
  blockName: 's-list',
  className: [
    {
      name: 'order',
      item: ['order'],
    },
    {
      name: 'unorder',
      item: ['unorder'],
    },
    {
      name: 'task',
      item: [
        {
          name: 'task',
          checkbox: ['checked'],
        },
      ],
    },
  ],
};

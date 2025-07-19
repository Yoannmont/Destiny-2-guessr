from rest_framework import pagination


class ItemPagination(pagination.PageNumberPagination):
    page_size = 42
    page_size_query_param = "page_size"
    max_page_size = 126

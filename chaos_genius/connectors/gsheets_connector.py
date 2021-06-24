from shillelagh.backends.apsw.db import connect

if __name__ == "__main__":
    connection = connect(":memory:")
    cursor = connection.cursor()

    sql = """
    SELECT *
    FROM "https://docs.google.com/spreadsheets/d/1yg3XFeLCZxPa6FHu01iLiM7le9Ru36hffwWW4N-TTNc/edit#gid=226796857"
    """
    for row in cursor.execute(sql):
        print(row)

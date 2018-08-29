import argparse
import logging
import os
import sys

sys.path.insert(1, os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, 'lib')))

import galaxy
import galaxy.app
import galaxy.config
from galaxy.objectstore import build_object_store_from_config
from galaxy.util import unicodify
from galaxy.util.bunch import Bunch
from galaxy.util.script import app_properties_from_args, populate_config_args
from galaxy.web.security import SecurityHelper
from galaxy.webapps.galaxy.controllers.page import _PageContentProcessor, _placeholderRenderForSave


def main(argv):
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('-k', '--secret-key', help='Key to convert pages with', default='')
    parser.add_argument('-d', '--dry-run', help='No changes, just test it.', action='store_true')
    populate_config_args(parser)
    args = parser.parse_args()
    properties = app_properties_from_args(args)
    config = galaxy.config.Configuration(**properties)
    secret = args.secret_key or config.id_secret
    security_helper = SecurityHelper(id_secret=secret)
    object_store = build_object_store_from_config(config)
    if not config.database_connection:
        logging.warning("The database connection is empty. If you are using the default value, please uncomment that in your galaxy.yml")

    model = galaxy.config.init_models_from_config(config, object_store=object_store)
    session = model.context.current
    pagerevs = session.query(model.PageRevision).all()
    mock_trans = Bunch(app=Bunch(security=security_helper), model=model, user_is_admin=lambda: True, sa_session=session)
    try:
        for p in pagerevs:
            processor = _PageContentProcessor(mock_trans, _placeholderRenderForSave)
            processor.feed(p.content)
            if not args.dry_run:
                p.content = unicodify(processor.output(), 'utf-8')
                session.add(p)
            else:
                print("Modifying revision %s.  Original, followed by new content, below." % p.id)
                print('=' * 80)
                print(p.content)
                print('_' * 80)
                print(unicodify(processor.output(), 'utf-8'))
                print('=' * 80)
    except Exception:
        logging.exception("Error parsing page, rolling everything back.  Please report this error.")
        session.rollback()
        exit(2)
    session.flush()


if __name__ == '__main__':
    main(sys.argv)
